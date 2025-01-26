import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getStorage } from '@/lib/storage';
import { validateUrl } from '@/lib/validation';
import { RequestStatus } from '@/types/request';

type RequestContext = {
  params: {
    id: string;
  };
};

export async function POST(
  req: NextRequest,
  { params }: RequestContext
): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }

    const requestId = Number(params.id);
    if (isNaN(requestId)) {
      return NextResponse.json({ error: '無効なリクエストIDです' }, { status: 400 });
    }

    const request = await prisma.request.findUnique({
      where: { id: requestId },
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

    if (!request) {
      return NextResponse.json({ error: 'リクエストが見つかりません' }, { status: 404 });
    }

    if (request.receiverId !== session.user.id) {
      return NextResponse.json({ error: '権限がありません' }, { status: 403 });
    }

    if (request.status !== RequestStatus.ACCEPTED) {
      return NextResponse.json({ error: 'このリクエストは納品できません' }, { status: 400 });
    }

    const formData = await req.formData();
    const deliveryType = formData.get('delivery_type')?.toString();
    const deliveryComment = formData.get('delivery_comment')?.toString();

    let filePath: string | null = null;
    let deliveryUrl: string | null = null;

    if (deliveryType === 'file') {
      const file = formData.get('file') as File;
      if (!file) {
        return NextResponse.json({ error: 'ファイルが必要です' }, { status: 400 });
      }

      const storage = getStorage();
      filePath = await storage.uploadDelivery(file);
    } else if (deliveryType === 'url') {
      const url = formData.get('url')?.toString();
      if (!url || !validateUrl(url)) {
        return NextResponse.json({ error: '有効なURLを入力してください' }, { status: 400 });
      }
      deliveryUrl = url;
    }

    const updatedRequest = await prisma.request.update({
      where: { id: requestId },
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
    });

    return NextResponse.json({
      id: updatedRequest.id,
      status: updatedRequest.status,
      title: updatedRequest.title,
      description: updatedRequest.description,
      sender: {
        id: updatedRequest.sender.id,
        username: updatedRequest.sender.username,
        display_name: updatedRequest.sender.name,
        avatar_url: updatedRequest.sender.image
      },
      receiver: {
        id: updatedRequest.receiver.id,
        username: updatedRequest.receiver.username,
        display_name: updatedRequest.receiver.name,
        avatar_url: updatedRequest.receiver.image
      },
      created_at: updatedRequest.createdAt
    });
  } catch (error) {
    console.error('Error delivering request:', error);
    return NextResponse.json({
      error: 'Internal Server Error',
      message: '依頼の納品に失敗しました'
    }, { status: 500 });
  }
} 