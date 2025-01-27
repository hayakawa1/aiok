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

    try {
      // もしまだConnectアカウントがなければ作成する
      let accountId = user.stripeConnectAccountId;
      if (!accountId) {
        // 新規アカウントの作成
        const account = await stripe.accounts.create({
          type: 'express',
          country: 'JP',
          email: user.email!,
          capabilities: {
            transfers: { requested: true }
          }
        });
        accountId = account.id;

        // ユーザー情報を更新
        await prisma.user.update({
          where: { id: user.id },
          data: { stripeConnectAccountId: accountId }
        });
      }

      // アカウントリンクを作成
      const accountLink = await stripe.accountLinks.create({
        account: accountId,
        refresh_url: `${process.env.NEXT_PUBLIC_BASE_URL}/settings/payment`,
        return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/settings/payment`,
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