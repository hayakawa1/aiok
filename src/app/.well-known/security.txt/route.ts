import { NextResponse } from 'next/server'

export async function GET() {
  const content = `Contact: mailto:security@aiok.jp
Expires: 2025-12-31T23:59:59.000Z
Preferred-Languages: ja, en
Canonical: https://www.aiok.jp/.well-known/security.txt
Policy: https://www.aiok.jp/security-policy
`

  return new NextResponse(content, {
    headers: {
      'Content-Type': 'text/plain',
      'Cache-Control': 'public, max-age=3600'
    }
  })
} 