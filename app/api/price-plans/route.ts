import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET() {
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

    const plans = await prisma.pricePlan.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(plans);
  } catch (error) {
    console.error('Error fetching price plans:', error);
    return new NextResponse('Internal error', { status: 500 });
  }
}

export async function POST(req: Request) {
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

    const body = await req.json();
    console.log('Request body:', body);

    // バリデーション
    const { title, description, amount } = body;

    // 詳細なバリデーション
    if (!title) {
      return NextResponse.json({ error: 'タイトルは必須です' }, { status: 400 });
    }
    if (!description) {
      return NextResponse.json({ error: '説明は必須です' }, { status: 400 });
    }
    if (!amount || isNaN(Number(amount)) || Number(amount) < 100) {
      return NextResponse.json({ error: '金額は100円以上で入力してください' }, { status: 400 });
    }

    const pricePlan = await prisma.pricePlan.create({
      data: {
        userId: user.id,
        title: title.trim(),
        description: description.trim(),
        amount: Number(amount)
      }
    });

    return NextResponse.json(pricePlan);
  } catch (error) {
    console.error('Error creating price plan:', error);
    return NextResponse.json(
      { error: '価格プランの作成に失敗しました' },
      { status: 500 }
    );
  }
} 