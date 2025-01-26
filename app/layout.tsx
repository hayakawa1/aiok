import './globals.css'
import { Inter } from 'next/font/google'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { headers } from 'next/headers'
import { Providers } from './providers'
import { Navigation } from './components/Navigation'
import type { ReactNode } from 'react'
import React from 'react'
import type { Metadata } from "next";
import { Toaster } from 'react-hot-toast'

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
})

export const metadata: Metadata = {
  title: 'AIOK',
  description: 'AIを活用したプロフェッショナルのためのプラットフォーム',
}

export default async function RootLayout({
  children,
}: {
  children: ReactNode
}) {
  const session = await getServerSession(authOptions)

  return (
    <html lang="ja" className={inter.className}>
      <head>
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@48,400,0,0" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@300;400;500;700&display=swap" />
      </head>
      <body>
        <Providers session={session}>
          <Navigation session={session} />
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </main>
          <Toaster />
          <footer className="bg-gray-50 mt-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500">
                <div className="flex items-center gap-4">
                  <a href="/terms" className="hover:text-gray-700">利用規約</a>
                  <a href="/commerce" className="hover:text-gray-700">特定商取引法に基づく表記</a>
                  <a href="/guidelines" className="hover:text-gray-700">ガイドライン</a>
                  <a href="/privacy" className="hover:text-gray-700">プライバシーポリシー</a>
                  <a href="/copyright" className="hover:text-gray-700">著作権・権利帰属</a>
                </div>
                <div className="text-gray-400">
                  &copy; 2024 AIOK All rights reserved.
                </div>
              </div>
            </div>
          </footer>
        </Providers>
      </body>
    </html>
  )
} 