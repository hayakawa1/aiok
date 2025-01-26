import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import Stripe from 'stripe';

export const dynamic = 'force-dynamic';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia'
});

export async function GET() {
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

  try {
    // もしまだConnectアカウントがなければ作成する
    let connectAccountId = user.stripeConnectAccountId;
    if (!connectAccountId) {
      // 新規アカウントの作成
      const account = await stripe.accounts.create({
        type: 'express',
        country: 'JP',
        business_type: 'individual',
        business_profile: {
          product_description: 'プロフェッショナルサービス'
        }
      });
      connectAccountId = account.id;
      // DBに保存
      await prisma.user.update({
        where: { id: user.id },
        data: { stripeConnectAccountId: connectAccountId }
      });
    }

    // このタイミングでアカウントリンクを作成
    const accountLink = await stripe.accountLinks.create({
      account: connectAccountId,
      refresh_url: `${process.env.NEXTAUTH_URL}/settings`,
      return_url: `${process.env.NEXTAUTH_URL}/settings`,
      type: 'account_onboarding',
    });

    return NextResponse.json({ accountLink: accountLink.url });
  } catch (error) {
    console.error('Error creating Stripe Connect account:', error);
    return NextResponse.json(
      { error: 'Stripeアカウントの作成に失敗しました' },
      { status: 500 }
    );
  }
} 