import { getServerSession } from 'next-auth/next'
import { NextRequest, NextResponse } from 'next/server'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { RequestStatus } from '@/types/request'

type RequestContext = {
  params: {
    id: string
  }
}

export async function POST(req: NextRequest, { params }: RequestContext): Promise<NextResponse> {
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
        receiver: true
      }
    })

    if (!requestData) {
      return NextResponse.json({ error: '依頼が見つかりません' }, { status: 404 })
    }

    if (requestData.receiverId !== user.id) {
      return NextResponse.json({ error: '権限がありません' }, { status: 403 })
    }

    const { fileName, fileKey } = await req.json()

    // ファイル情報をDBに登録
    const file = await prisma.requestFile.create({
      data: {
        requestId: params.id,
        fileName,
        fileUrl: `${process.env.R2_PUBLIC_URL}/${fileKey}`,
      }
    })

    // 依頼のステータスを更新
    await prisma.request.update({
      where: { id: params.id },
      data: {
        status: RequestStatus.DELIVERED
      }
    })

    return NextResponse.json({ file })

  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: '内部エラーが発生しました' }, { status: 500 })
  }
} 