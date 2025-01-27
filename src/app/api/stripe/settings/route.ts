import { getServerSession } from 'next-auth/next';
import { NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { stripe } from '@/lib/stripe';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: {
        email: session.user.email
      }
    });

    if (!user || !user.stripeConnectAccountId) {
      return new NextResponse('Stripe account not found', { status: 404 });
    }

    const account = await stripe.accounts.retrieve(user.stripeConnectAccountId);
    return NextResponse.json(account);
  } catch (error) {
    console.error('Error retrieving Stripe account:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 