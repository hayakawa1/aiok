import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return new NextResponse('User not found', { status: 404 });
    }

    const plan = await prisma.pricePlan.findUnique({
      where: { id: parseInt(params.id) }
    });

    if (!plan) {
      return new NextResponse('Plan not found', { status: 404 });
    }

    if (plan.userId !== user.id) {
      return new NextResponse('Forbidden', { status: 403 });
    }

    const body = await request.json();
    const { title, description, amount } = body;

    // バリデーション
    if (!title || title.length > 100) {
      return new NextResponse('プラン名は1-100文字で入力してください', { status: 400 });
    }

    if (!description || description.length > 1000) {
      return new NextResponse('説明は1-1000文字で入力してください', { status: 400 });
    }

    if (!amount || amount < 100 || amount > 1000000) {
      return new NextResponse('金額は100-1,000,000円の範囲で入力してください', { status: 400 });
    }

    const updatedPlan = await prisma.pricePlan.update({
      where: { id: parseInt(params.id) },
      data: {
        title,
        description,
        amount,
      },
    });

    return NextResponse.json(updatedPlan);
  } catch (error) {
    console.error('Error updating price plan:', error);
    return new NextResponse('Internal error', { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return new NextResponse('User not found', { status: 404 });
    }

    const plan = await prisma.pricePlan.findUnique({
      where: { id: parseInt(params.id) }
    });

    if (!plan) {
      return new NextResponse('Plan not found', { status: 404 });
    }

    if (plan.userId !== user.id) {
      return new NextResponse('Forbidden', { status: 403 });
    }

    await prisma.pricePlan.delete({
      where: { id: parseInt(params.id) },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting price plan:', error);
    return new NextResponse('Internal error', { status: 500 });
  }
} 