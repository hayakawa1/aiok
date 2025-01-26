import { getServerSession } from 'next-auth/next'
import { NextRequest, NextResponse } from 'next/server'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getStorage } from '@/lib/storage'
import { RequestStatus } from '@/types/request'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
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

  const request = await prisma.request.findUnique({
    where: { id: parseInt(params.id) },
    include: {
      sender: {
        select: {
          id: true,
          email: true
        }
      },
      receiver: {
        select: {
          id: true,
          email: true
        }
      }
    }
  })

  if (!request) {
    return NextResponse.json({ error: '依頼が見つかりません' }, { status: 404 })
  }

  // デバッグ用にログを追加
  console.log('Request:', {
    id: request.id,
    senderId: request.senderId,
    receiverId: request.receiverId,
    status: request.status,
    sender: request.sender,
    receiver: request.receiver,
    currentUser: user
  })

  if (request.receiverId !== user.id) {
    return NextResponse.json({ 
      error: '権限がありません',
      debug: { receiverId: request.receiverId, userId: user.id }
    }, { status: 403 })
  }

  // 依頼が承認済み状態でない場合は納品できない
  if (request.status !== RequestStatus.ACCEPTED) {
    return NextResponse.json({ 
      error: '承認済みの依頼のみ納品可能です',
      debug: { status: request.status }
    }, { status: 400 })
  }

  try {
    const formData = await req.formData()
    const files = formData.getAll('files')
    if (!files || files.length === 0 || !files.every(file => file instanceof Blob)) {
      return NextResponse.json({ error: 'ファイルが選択されていません' }, { status: 400 })
    }

    const storage = getStorage()
    const fileUrl = await storage.uploadRequestFiles(files as File[])

    // ファイル情報を保存（ZIPファイルとして1つ保存）
    const requestFile = await prisma.requestFile.create({
      data: {
        requestId: parseInt(params.id),
        fileName: `request-${params.id}-files.zip`,
        fileUrl: fileUrl
      }
    })

    // ファイルのアップロードが成功したら、リクエストをDELIVEREDに更新
    const updatedRequest = await prisma.request.update({
      where: { id: parseInt(params.id) },
      data: {
        status: RequestStatus.DELIVERED
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
    })

    return NextResponse.json({
      files: [requestFile],
      status: updatedRequest.status
    })
  } catch (error) {
    console.error('Error uploading file:', error)
    return NextResponse.json(
      { error: 'ファイルのアップロードに失敗しました' },
      { status: 500 }
    )
  }
} 