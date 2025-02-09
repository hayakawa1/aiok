import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { stripe } from '@/lib/stripe';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
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

    // デバッグ用にログを追加
    console.log('User:', {
      id: user.id,
      email: user.email,
      stripeConnectAccountId: user.stripeConnectAccountId
    });

    // 本番環境ではHTTPSを強制、wwwを除去
    const baseUrl = process.env.NODE_ENV === 'production' 
      ? 'https://aiok.jp'
      : 'http://localhost:3000';

    try {
      // 既存のConnectアカウントがある場合
      if (user.stripeConnectAccountId) {
        try {
          // まずログインリンクの作成を試みる
          const loginLink = await stripe.accounts.createLoginLink(user.stripeConnectAccountId);
          return NextResponse.json({ url: loginLink.url });
        } catch (error) {
          // オンボーディングが完了していない場合は新しいアカウントリンクを作成
          if (error instanceof Error && error.message.includes('not completed onboarding')) {
            const accountLink = await stripe.accountLinks.create({
              account: user.stripeConnectAccountId,
              refresh_url: `${baseUrl}/settings`,
              return_url: `${baseUrl}/settings`,
              type: 'account_onboarding'
            });
            return NextResponse.json({ url: accountLink.url });
          }
          throw error;
        }
      }

      // 新規アカウントの作成
      const account = await stripe.accounts.create({
        type: 'express',
        country: 'JP',
        email: user.email!,
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true }
        },  business_type: 'individual',
        business_profile: {
          url: baseUrl,
          mcc: '7399',  // ビジネスサービス（その他）
          product_description: 'AIを活用したコンテンツ制作・クリエイティブサービス'
        }
      });

      // ユーザー情報を更新
      await prisma.user.update({
        where: { id: user.id },
        data: { stripeConnectAccountId: account.id }
      });

      // 新規アカウント用のオンボーディングリンクを作成
      const accountLink = await stripe.accountLinks.create({
        account: account.id,
        refresh_url: `${baseUrl}/settings`,
        return_url: `${baseUrl}/settings`,
        type: 'account_onboarding'
      });

      return NextResponse.json({ url: accountLink.url });
    } catch (error) {
      console.error('Stripe error:', error);
      return NextResponse.json(
        { error: 'Stripeアカウントの作成に失敗しました' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: '内部エラーが発生しました' },
      { status: 500 }
    );
  }
} 