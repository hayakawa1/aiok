import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { RequestStatus } from '@/app/types/request';

export const dynamic = 'force-dynamic';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
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

    const requestData = await prisma.request.findUnique({
      where: { id: parseInt(params.id) }
    });

    if (!requestData) {
      return NextResponse.json({ error: '依頼が見つかりません' }, { status: 404 });
    }

    if (requestData.receiverId !== user.id) {
      return NextResponse.json({ error: '権限がありません' }, { status: 403 });
    }

    if (requestData.status !== RequestStatus.PENDING) {
      return NextResponse.json({ error: 'この依頼は既に処理されています' }, { status: 400 });
    }

    const updatedRequest = await prisma.request.update({
      where: { id: parseInt(params.id) },
      data: { status: RequestStatus.REJECTED }
    });

    return NextResponse.json(updatedRequest);
  } catch (error) {
    console.error('Error rejecting request:', error);
    return NextResponse.json({ error: '内部エラーが発生しました' }, { status: 500 });
  }
} 