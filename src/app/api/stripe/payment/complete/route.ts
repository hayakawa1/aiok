import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';
import { RequestStatus } from '@/types/request';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const authSession = await getServerSession(authOptions);
    if (!authSession?.user?.email) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }

    const { sessionId, requestId } = await req.json();
    if (!sessionId || !requestId) {
      return NextResponse.json({ error: 'セッションIDと依頼IDが必要です' }, { status: 400 });
    }

    // Stripeセッションの取得
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (!session?.metadata?.requestId || session.metadata.requestId !== requestId) {
      return NextResponse.json({ error: 'セッション情報が不正です' }, { status: 400 });
    }

    // 支払い状態の確認
    if (session.payment_status !== 'paid') {
      return NextResponse.json({ error: '支払いが完了していません' }, { status: 400 });
    }

    // リクエストのステータスを更新
    await prisma.request.update({
      where: { id: requestId },
      data: { status: RequestStatus.COMPLETED }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Payment completion error:', error);
    return NextResponse.json(
      { error: '支払い処理の完了に失敗しました' },
      { status: 500 }
    );
  }
} 