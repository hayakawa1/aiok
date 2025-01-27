import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
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
      where: { id: params.id },
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
        },
        files: {
          select: {
            id: true,
            fileName: true,
            fileUrl: true,
            password: true,
            createdAt: true
          }
        }
      }
    })

    if (!requestData) {
      return NextResponse.json({ error: '依頼が見つかりません' }, { status: 404 })
    }

    // ユーザーが依頼の送信者または受信者であることを確認
    if (requestData.senderId !== user.id && requestData.receiverId !== user.id) {
      return NextResponse.json({ error: 'この依頼にアクセスする権限がありません' }, { status: 403 })
    }

    return NextResponse.json({
      id: requestData.id,
      status: requestData.status,
      title: requestData.title,
      description: requestData.description,
      amount: requestData.amount,
      sender: {
        id: requestData.sender.id,
        username: requestData.sender.username,
        name: requestData.sender.name,
        image: requestData.sender.image
      },
      receiver: {
        id: requestData.receiver.id,
        username: requestData.receiver.username,
        name: requestData.receiver.name,
        image: requestData.receiver.image
      },
      files: requestData.files,
      created_at: requestData.createdAt
    })
  } catch (error) {
    console.error('Error fetching request:', error)
    return NextResponse.json(
      { error: '依頼の取得に失敗しました' },
      { status: 500 }
    )
  }
} 