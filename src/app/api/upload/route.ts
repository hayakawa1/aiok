import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

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

    // TODO: ここで実際の画像アップロード処理を実装
    // 例: AWS S3やCloudinaryなどのサービスを使用

    // 仮の実装として、Base64エンコードした画像URLを返す
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = buffer.toString('base64');
    const mimeType = file.type;
    const dataUrl = `data:${mimeType};base64,${base64}`;

    // ユーザーのimage URLを更新
    await prisma.user.update({
      where: { email: session.user.email },
      data: { image: dataUrl },
    });

    return NextResponse.json({ url: dataUrl });
  } catch (error) {
    console.error('Upload error:', error);
    return new NextResponse('Internal error', { status: 500 });
  }
} 