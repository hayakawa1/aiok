import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(request: NextRequest) {
  // ファイルアップロードエンドポイントの処理
  if (request.nextUrl.pathname.includes('/api/requests') && request.nextUrl.pathname.includes('/upload')) {
    const token = await getToken({ req: request })
    if (!token) {
      return new NextResponse(
        JSON.stringify({ error: 'Authentication required' }),
        { status: 401 }
      )
    }
  }

  // Stripe関連エンドポイントの保護
  if (request.nextUrl.pathname.startsWith('/api/stripe')) {
    // 国別制限（Cloudflareヘッダーを使用）
    const country = request.headers.get('cf-ipcountry')
    if (country && country !== 'JP') {
      return new NextResponse(
        JSON.stringify({ error: 'Access denied: Country not allowed' }),
        { status: 403 }
      )
    }

    // 認証チェック
    const token = await getToken({ req: request })
    if (!token) {
      return new NextResponse(
        JSON.stringify({ error: 'Authentication required' }),
        { status: 401 }
      )
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/api/stripe/:path*',
    '/api/requests/:path*/upload',
    '/api/requests/:path*/upload/complete'
  ]
} 