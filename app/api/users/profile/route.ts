import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getStorage } from '@/lib/storage';
import { validateText } from '@/lib/validation';

// GETリクエスト - プロフィール取得
export async function GET(): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        email: true,
        username: true,
        name: true,
        bio: true,
        image: true,
        stripeConnectAccountId: true,
        hourlyRate: true
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'ユーザーが見つかりません' }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('Error fetching profile:', error);
    return NextResponse.json(
      { error: 'プロフィールの取得に失敗しました' },
      { status: 500 }
    );
  }
}

// POSTリクエスト - プロフィール更新（マルチパートフォームデータ対応）
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }

    const formData = await request.formData();
    const storage = getStorage();

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: 'ユーザーが見つかりません' }, { status: 404 });
    }

    // 基本情報の更新
    const username = formData.get('username')?.toString();
    const displayName = formData.get('display_name')?.toString();
    const bio = formData.get('bio')?.toString();
    const hourlyRate = formData.get('hourly_rate')?.toString();

    // バリデーション
    if (username) {
      const usernameValidation = validateText(username, 'ユーザー名', { maxLength: 30 });
      if (!usernameValidation.isValid) {
        return NextResponse.json({ error: usernameValidation.message }, { status: 400 });
      }
    }

    if (displayName) {
      const displayNameValidation = validateText(displayName, '表示名', { maxLength: 50 });
      if (!displayNameValidation.isValid) {
        return NextResponse.json({ error: displayNameValidation.message }, { status: 400 });
      }
    }

    if (bio) {
      const bioValidation = validateText(bio, '自己紹介', { maxLength: 160 });
      if (!bioValidation.isValid) {
        return NextResponse.json({ error: bioValidation.message }, { status: 400 });
      }
    }

    // アバター画像の処理
    const avatarFile = formData.get('avatar') as File | null;
    let avatarUrl = user.image;
    if (avatarFile && avatarFile.size > 0) {
      if (!avatarFile.type.startsWith('image/')) {
        return NextResponse.json({ error: 'アップロードされたファイルは画像ではありません' }, { status: 400 });
      }

      if (avatarFile.size > 5 * 1024 * 1024) {
        return NextResponse.json({ error: '画像サイズは5MB以下にしてください' }, { status: 400 });
      }

      // 古いアバター画像の削除
      if (user.image && user.image.includes('r2.dev')) {
        try {
          await storage.deleteFile(user.image);
        } catch (error) {
          console.warn('Failed to delete old avatar:', error);
        }
      }

      // 新しいアバター画像のアップロード
      avatarUrl = await storage.uploadAvatar(avatarFile);
    }

    // ユーザー情報の更新
    const updatedUser = await prisma.user.update({
      where: { email: session.user.email },
      data: {
        username: username?.trim(),
        name: displayName?.trim(),
        bio: bio?.trim(),
        image: avatarUrl,
        hourlyRate: hourlyRate ? parseInt(hourlyRate) : null
      }
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json({ error: 'プロフィールの更新に失敗しました' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = await request.json();
    const { name, bio } = body;

    const updatedUser = await prisma.user.update({
      where: { email: session.user.email },
      data: {
        name,
        bio,
      },
    });

    return NextResponse.json({
      name: updatedUser.name || '',
      bio: updatedUser.bio || '',
      image: updatedUser.image || '',
    });
  } catch (error) {
    console.error('Profile update error:', error);
    return new NextResponse('Internal error', { status: 500 });
  }
} 