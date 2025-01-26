import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { RequestStatus } from '@/types/request';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia'
});

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get('session_id');
    
    if (!sessionId) {
      return NextResponse.json({ error: 'セッションIDが見つかりません' }, { status: 400 });
    }

    // Stripeセッションを取得して支払い状態を確認
    const stripeSession = await stripe.checkout.sessions.retrieve(sessionId);
    
    if (stripeSession.payment_status !== 'paid') {
      return NextResponse.json({ error: '支払いが完了していません' }, { status: 400 });
    }

    // リクエストのステータスを更新
    await prisma.request.update({
      where: { id: parseInt(params.id) },
      data: { status: RequestStatus.COMPLETED }
    });

    // 成功レスポンス
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error processing payment success:', error);
    return NextResponse.json(
      { error: '支払い処理の確認に失敗しました' },
      { status: 500 }
    );
  }
} 