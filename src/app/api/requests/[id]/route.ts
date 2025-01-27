import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'

type RequestContext = {
  params: {
    id: string;
  };
};

type RequestFileCreateInput = {
  requestId: string;
  fileName: string;
  fileUrl: string;
  password?: string;
};

export const dynamic = 'force-dynamic'

export async function GET(
  request: Request,
  { params }: RequestContext
) {
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

    const requestData = await prisma.request.findUnique({
      where: { id: String(params.id) },
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
            image: true,
            stripeConnectAccountId: true
          }
        },
        files: true
      }
    })

    if (!requestData) {
      return NextResponse.json({ error: '依頼が見つかりません' }, { status: 404 })
    }

    // ユーザーが依頼の送信者または受信者であることを確認
    if (requestData.senderId !== user.id && requestData.receiverId !== user.id) {
      return NextResponse.json({ error: 'この依頼にアクセスする権限がありません' }, { status: 403 })
    }

    return NextResponse.json(requestData)
  } catch (error) {
    console.error('Error fetching request:', error)
    return NextResponse.json(
      { error: '依頼の取得に失敗しました' },
      { status: 500 }
    )
  }
} 