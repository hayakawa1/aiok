import { getServerSession } from 'next-auth/next'
import { NextRequest, NextResponse } from 'next/server'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { validateText, validateAmount } from '@/lib/validation'
import { RequestStatus } from '@/types/request'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'ユーザーが見つかりません' }, { status: 404 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'received'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const sortBy = searchParams.get('sortBy') || 'createdAt'
    const sortOrder = searchParams.get('sortOrder') || 'desc'
    const status = searchParams.get('status')

    const skip = (page - 1) * limit

    const where = {
      ...(type === 'received' ? { receiverId: user.id } : { senderId: user.id }),
      ...(status ? { status: status as RequestStatus } : {})
    }

    // 総件数を取得
    const total = await prisma.request.count({ where })

    // ソート条件を設定
    const orderBy: any = {}
    if (sortBy === 'amount') {
      orderBy.amount = sortOrder
    } else if (sortBy === 'updatedAt') {
      orderBy.updatedAt = sortOrder
    } else {
      orderBy.createdAt = sortOrder
    }

    const requests = await prisma.request.findMany({
      where,
      include: {
        sender: {
          select: {
            id: true,
            username: true,
            name: true,
            image: true
          }
        },
        receiver: {
          select: {
            id: true,
            username: true,
            name: true,
            image: true
          }
        }
      },
      orderBy,
      skip,
      take: limit
    })

    return NextResponse.json({
      requests,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching requests:', error)
    return NextResponse.json({ error: '依頼の取得に失敗しました' }, { status: 500 })
  }
}

interface RequestData {
  receiver_id: string;
  title: string;
  description: string;
  amount: number;
}

export async function POST(req: NextRequest) {
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

  const data = await req.json() as RequestData;

  // バリデーション
  const titleValidation = validateText(data.title, 'タイトル');
  const descriptionValidation = validateText(data.description, '説明');
  
  if (!titleValidation.isValid || !descriptionValidation.isValid || !validateAmount(data.amount) || !data.receiver_id) {
    return NextResponse.json(
      { 
        error: titleValidation.message || descriptionValidation.message || '金額が不正か、受信者が指定されていません' 
      },
      { status: 400 }
    );
  }

  try {
    const newRequest = await prisma.request.create({
      data: {
        title: data.title.trim(),
        description: data.description.trim(),
        amount: data.amount,
        status: RequestStatus.PENDING,
        receiverId: data.receiver_id,
        senderId: user.id
      },
      include: {
        sender: {
          select: {
            id: true,
            username: true,
            name: true,
            image: true
          }
        },
        receiver: {
          select: {
            id: true,
            username: true,
            name: true,
            image: true
          }
        }
      }
    });

    return NextResponse.json(newRequest);
  } catch (error) {
    console.error('Error creating request:', error);
    return NextResponse.json(
      { error: '依頼の作成に失敗しました' },
      { status: 500 }
    );
  }
} 