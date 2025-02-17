import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(request: NextRequest) {
  // CORSヘッダーの設定
  const response = NextResponse.next()
  response.headers.set('Access-Control-Allow-Credentials', 'true')
  response.headers.set('Access-Control-Allow-Origin', request.headers.get('origin') || '*')
  response.headers.set('Access-Control-Allow-Methods', 'GET,DELETE,PATCH,POST,PUT,OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With')

  // OPTIONSリクエストの場合は即座に返す
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, {
      status: 200,
      headers: response.headers
    })
  }

  // ファイルアップロードエンドポイントの処理
  if (request.nextUrl.pathname.includes('/api/requests') && request.nextUrl.pathname.includes('/upload')) {
    const token = await getToken({ req: request })
    if (!token) {
      return new NextResponse(
        JSON.stringify({ error: 'Authentication required' }),
        { 
          status: 401, 
          headers: response.headers
        }
      )
    }
    return response
  }

  // Stripe関連エンドポイントの保護
  if (request.nextUrl.pathname.startsWith('/api/stripe')) {
    // 国別制限（Cloudflareヘッダーを使用）
    const country = request.headers.get('cf-ipcountry')
    if (country && country !== 'JP') {
      return new NextResponse(
        JSON.stringify({ error: 'Access denied: Country not allowed' }),
        { status: 403, headers: response.headers }
      )
    }

    // 認証チェック
    const token = await getToken({ req: request })
    if (!token) {
      return new NextResponse(
        JSON.stringify({ error: 'Authentication required' }),
        { status: 401, headers: response.headers }
      )
    }
  }

  return response
}

export const config = {
  matcher: [
    '/api/stripe/:path*',
    '/api/requests/:path*/upload',
    '/api/requests/:path*/upload/complete',
    '/api/auth/:path*'
  ]
} 