import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import { getStorage } from '@/lib/storage';
import sharp from 'sharp';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('image') as File;
    if (!file) {
      return new NextResponse('No file uploaded', { status: 400 });
    }

    // 画像をBufferに変換
    const buffer = Buffer.from(await file.arrayBuffer());

    // 画像の処理
    const processedImageBuffer = await sharp(buffer)
      .resize(400, 400, {
        fit: 'cover',
        position: 'center'
      })
      .toBuffer();

    const storage = getStorage();
    // 処理済みの画像をアップロード
    const fileUrl = await storage.uploadAvatarBuffer(processedImageBuffer, file.type);
    console.log('Generated file URL:', fileUrl);  // デバッグログを追加

    // ユーザーのimage URLを更新
    await prisma.user.update({
      where: { email: session.user.email },
      data: { image: fileUrl },
    });

    return NextResponse.json({ url: fileUrl });
  } catch (error) {
    console.error('Upload error:', error);
    return new NextResponse('Internal error', { status: 500 });
  }
} 