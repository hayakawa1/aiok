import { getServerSession } from 'next-auth/next'
import { NextRequest, NextResponse } from 'next/server'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getStorage } from '@/lib/storage'
import { RequestStatus } from '@/types/request'
import { Prisma } from '@prisma/client'

type RequestContext = {
  params: {
    id: string
  }
}

const requestInclude = {
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
  }
} as const

type RequestWithRelations = Prisma.RequestGetPayload<{
  include: typeof requestInclude
}>

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest, { params }: RequestContext): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: '認証が必要です' },
        { 
          status: 401,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization'
          }
        }
      )
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'ユーザーが見つかりません' }, { status: 404 })
    }

    const requestData = await prisma.request.findUnique({
      where: { id: params.id },
      include: requestInclude
    }) as RequestWithRelations | null

    if (!requestData) {
      return NextResponse.json({ error: '依頼が見つかりません' }, { status: 404 })
    }

    // デバッグ用にログを追加
    console.log('Request:', {
      id: requestData.id,
      senderId: requestData.senderId,
      receiverId: requestData.receiverId,
      status: requestData.status,
      sender: requestData.sender,
      receiver: requestData.receiver,
      currentUser: user
    })

    if (requestData.receiverId !== user.id) {
      return NextResponse.json({ 
        error: '権限がありません',
        debug: { receiverId: requestData.receiverId, userId: user.id }
      }, { status: 403 })
    }

    // 依頼が承認済み状態でない場合は納品できない
    if (requestData.status !== RequestStatus.ACCEPTED && requestData.status !== RequestStatus.DELIVERED) {
      return NextResponse.json({ 
        error: 'この依頼はアップロードできない状態です',
        debug: { status: requestData.status }
      }, { status: 400 })
    }

    // リクエストボディからファイル名を取得
    const { filename } = await req.json();
    
    if (!filename) {
      return NextResponse.json({ error: 'ファイル名が指定されていません' }, { status: 400 });
    }

    const storage = getStorage();
    const { url, key } = await storage.getPresignedUploadUrl(filename);

    return NextResponse.json({ 
      uploadUrl: url,
      fileKey: key,
      requestId: params.id
    });

  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: '内部エラーが発生しました' }, { status: 500 })
  }
} 