import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';
import { RequestStatus } from '@/types/request';

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const sessionId = searchParams.get('session_id');

    if (!sessionId) {
      return NextResponse.redirect(new URL('/error?message=セッションIDが見つかりません', req.url));
    }

    // Stripeセッションの取得
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (!session?.metadata?.requestId) {
      return NextResponse.redirect(new URL('/error?message=リクエストIDが見つかりません', req.url));
    }

    // リクエストのステータスを更新
    await prisma.request.update({
      where: { id: session.metadata.requestId },
      data: { status: RequestStatus.COMPLETED }
    });

    // 成功ページにリダイレクト
    return NextResponse.redirect(new URL(`/requests/${session.metadata.requestId}`, req.url));
  } catch (error) {
    console.error('Payment success handling error:', error);
    return NextResponse.redirect(new URL('/error?message=支払い処理の完了に失敗しました', req.url));
  }
} 