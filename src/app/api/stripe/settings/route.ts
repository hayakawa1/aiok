import { getServerSession } from 'next-auth/next';
import { NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import Stripe from 'stripe';

export const dynamic = 'force-dynamic';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
});

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user || !user.stripeConnectAccountId) {
      return new NextResponse('Stripe account not found', { status: 404 });
    }

    try {
      // まずログインリンクの作成を試みる
      const loginLink = await stripe.accounts.createLoginLink(user.stripeConnectAccountId);
      return NextResponse.json({ url: loginLink.url });
    } catch (error) {
      if (error instanceof Stripe.errors.StripeError && error.message.includes('not completed onboarding')) {
        // オンボーディングが完了していない場合は新しいアカウントリンクを作成
        const accountLink = await stripe.accountLinks.create({
          account: user.stripeConnectAccountId,
          refresh_url: `${process.env.NEXTAUTH_URL}/settings`,
          return_url: `${process.env.NEXTAUTH_URL}/settings`,
          type: 'account_onboarding',
        });
        return NextResponse.json({ url: accountLink.url });
      }
      throw error;
    }
  } catch (error) {
    console.error('Error in stripe_settings:', error);
    return new NextResponse('Internal error', { status: 500 });
  }
} 