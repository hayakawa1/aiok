import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { stripe } from '@/lib/stripe';
import { Request as CustomRequest, RequestStatus } from '@/types/request';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: 'ユーザーが見つかりません' }, { status: 404 });
    }

    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get('session_id');

    if (!sessionId) {
      return NextResponse.json({ error: 'セッションIDが見つかりません' }, { status: 400 });
    }

    const checkoutSession = await stripe.checkout.sessions.retrieve(sessionId);

    // リクエストのステータスを更新
    await prisma.request.update({
      where: { id: params.id },
      data: { status: RequestStatus.COMPLETED }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error processing payment success:', error);
    return NextResponse.json(
      { error: '支払い完了の処理に失敗しました' },
      { status: 500 }
    );
  }
} 