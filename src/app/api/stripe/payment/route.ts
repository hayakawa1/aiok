import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { stripe } from '@/lib/stripe';
import { RequestStatus } from '@/types/request';

export async function POST(req: NextRequest) {
  try {
    const authSession = await getServerSession(authOptions);
    if (!authSession?.user?.email) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }

    const { requestId } = await req.json();
    if (!requestId) {
      return NextResponse.json({ error: '依頼IDが必要です' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: authSession.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: 'ユーザーが見つかりません' }, { status: 404 });
    }

    const requestData = await prisma.request.findUnique({
      where: { id: requestId },
      include: {
        sender: {
          select: {
            id: true,
            email: true,
            username: true,
            name: true,
            image: true
          }
        },
        receiver: {
          select: {
            id: true,
            email: true,
            username: true,
            name: true,
            image: true,
            stripeConnectAccountId: true
          }
        }
      }
    });

    if (!requestData) {
      return NextResponse.json({ error: '依頼が見つかりません' }, { status: 404 });
    }

    // 支払い者が依頼者本人であることを確認
    if (requestData.senderId !== user.id) {
      return NextResponse.json({ error: '権限がありません' }, { status: 403 });
    }

    // 受取人のStripe Connect IDが設定されているか確認
    if (!requestData.receiver.stripeConnectAccountId) {
      return NextResponse.json({ error: '受取人のStripe設定が完了していません' }, { status: 400 });
    }

    // プラットフォーム手数料（10%）を計算
    const platformFee = Math.floor(requestData.amount * 0.1);

    // リクエストヘッダーからホストを取得
    const host = req.headers.get('host');
    const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
    const baseUrl = `${protocol}://${host}`;

    // Stripe支払いセッションを作成
    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'jpy',
            product_data: {
              name: `依頼 #${requestData.id} の支払い`,
              description: requestData.title
            },
            unit_amount: requestData.amount
          },
          quantity: 1
        }
      ],
      mode: 'payment',
      success_url: `${baseUrl}/requests/${requestData.id}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/requests/${requestData.id}`,
      payment_intent_data: {
        application_fee_amount: platformFee,
        transfer_data: {
          destination: requestData.receiver.stripeConnectAccountId
        },
        metadata: {
          requestId: requestData.id,
          receiverId: requestData.receiverId
        }
      },
      metadata: {
        requestId: requestData.id,
        receiverId: requestData.receiverId
      }
    });

    if (!checkoutSession.url) {
      throw new Error('Checkout session URL is missing');
    }

    return NextResponse.json({ paymentUrl: checkoutSession.url });
  } catch (error) {
    console.error('Error creating payment session:', error);
    return NextResponse.json(
      { error: '支払いセッションの作成に失敗しました' },
      { status: 500 }
    );
  }
} 