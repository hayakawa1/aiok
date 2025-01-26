import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { RequestStatus } from '@/types/request';
import Stripe from 'stripe';

type RequestContext = {
  params: {
    id: string;
  };
};

export const dynamic = 'force-dynamic';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia'
});

// プラットフォーム手数料（10%）
const PLATFORM_FEE_PERCENTAGE = 0.1;

export async function POST(
  req: NextRequest,
  { params }: RequestContext
): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }

    const requestId = Number(params.id);
    if (!requestId || isNaN(requestId)) {
      return NextResponse.json({ error: '無効なリクエストIDです' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: 'ユーザーが見つかりません' }, { status: 404 });
    }

    const requestData = await prisma.request.findUnique({
      where: { id: requestId },
      include: {
        receiver: true
      }
    });

    if (!requestData) {
      return NextResponse.json({ error: '依頼が見つかりません' }, { status: 404 });
    }

    console.log('支払い処理デバッグ情報:', {
      requestId,
      status: requestData.status,
      senderId: requestData.senderId,
      currentUserId: user.id,
      receiverStripeAccount: requestData.receiver.stripeConnectAccountId,
      isCorrectSender: requestData.senderId === user.id,
      isDelivered: requestData.status === RequestStatus.DELIVERED
    });

    if (requestData.senderId !== user.id) {
      return NextResponse.json({ error: '権限がありません' }, { status: 403 });
    }

    if (requestData.status !== RequestStatus.DELIVERED) {
      return NextResponse.json({ 
        error: '納品済みの依頼のみ支払いできます',
        currentStatus: requestData.status
      }, { status: 400 });
    }

    if (!requestData.receiver.stripeConnectAccountId) {
      return NextResponse.json({ error: '受信者のStripeアカウントが設定されていません' }, { status: 400 });
    }

    // プラットフォーム手数料を計算
    const platformFee = Math.floor(requestData.amount * PLATFORM_FEE_PERCENTAGE);

    // Stripe支払いセッションを作成
    const stripeSession = await stripe.checkout.sessions.create({
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
      success_url: `${process.env.NEXTAUTH_URL}/requests/${requestData.id}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXTAUTH_URL}/requests/${requestData.id}?payment=cancel`,
      payment_intent_data: {
        application_fee_amount: platformFee,
        transfer_data: {
          destination: requestData.receiver.stripeConnectAccountId
        },
        metadata: {
          requestId: requestData.id.toString(),
          receiverId: requestData.receiverId
        }
      }
    });

    return NextResponse.json({ paymentUrl: stripeSession.url });
  } catch (error) {
    console.error('Error creating payment session:', error);
    return NextResponse.json(
      { error: '支払いセッションの作成に失敗しました' },
      { status: 500 }
    );
  }
} 