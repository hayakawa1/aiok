import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(request: NextRequest) {
  // CORSヘッダーの設定
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Origin': request.headers.get('origin') || '*',
        'Access-Control-Allow-Credentials': 'true'
      },
    })
  }

  // ファイルアップロードエンドポイントの処理
  if (request.nextUrl.pathname.includes('/api/requests') && request.nextUrl.pathname.endsWith('/upload')) {
    const token = await getToken({ req: request })
    if (!token) {
      return new NextResponse(
        JSON.stringify({ error: 'Authentication required' }),
        { 
          status: 401, 
          headers: { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': request.headers.get('origin') || '*',
            'Access-Control-Allow-Credentials': 'true'
          } 
        }
      )
    }
    return NextResponse.next()
  }

  // Stripe関連エンドポイントの保護
  if (request.nextUrl.pathname.startsWith('/api/stripe')) {
    // 国別制限（Cloudflareヘッダーを使用）
    const country = request.headers.get('cf-ipcountry')
    if (country && country !== 'JP') {
      return new NextResponse(
        JSON.stringify({ error: 'Access denied: Country not allowed' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // 認証チェック
    const token = await getToken({ req: request })
    if (!token) {
      return new NextResponse(
        JSON.stringify({ error: 'Authentication required' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      )
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/api/stripe/:path*',
    '/api/requests/:id/upload'
  ]
} 