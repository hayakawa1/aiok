'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useSession, signIn, signOut } from 'next-auth/react'

export function Header() {
  const { data: session } = useSession()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <header className="bg-white shadow">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="text-2xl font-bold text-indigo-600">
                AIOK
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link
                href="/requests"
                className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900"
              >
                依頼を探す
              </Link>
              <Link
                href="/requests/new"
                className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900"
              >
                依頼を作成
              </Link>
            </div>
          </div>

          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            {session ? (
              <div className="flex items-center space-x-4">
                <Link
                  href="/dashboard"
                  className="text-sm font-medium text-gray-900"
                >
                  ダッシュボード
                </Link>
                <button
                  onClick={() => signOut()}
                  className="text-sm font-medium text-gray-900"
                >
                  ログアウト
                </button>
                <Link href="/profile" className="flex items-center space-x-2">
                  {session.user?.image ? (
                    <Image
                      src={session.user.image}
                      alt="Profile"
                      width={32}
                      height={32}
                      className="rounded-full"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gray-200" />
                  )}
                  <span className="text-sm font-medium text-gray-900">
                    {session.user?.name}
                  </span>
                </Link>
              </div>
            ) : (
              <button
                onClick={() => signIn('google')}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
              >
                ログイン
              </button>
            )}
          </div>

          <div className="flex items-center sm:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
            >
              <span className="sr-only">メニューを開く</span>
              {/* ハンバーガーメニューアイコン */}
              <svg
                className="h-6 w-6"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>
        </div>
      </nav>

      {/* モバイルメニュー */}
      {isMenuOpen && (
        <div className="sm:hidden">
          <div className="pt-2 pb-3 space-y-1">
            <Link
              href="/requests"
              className="block pl-3 pr-4 py-2 text-base font-medium text-gray-700"
            >
              依頼を探す
            </Link>
            <Link
              href="/requests/new"
              className="block pl-3 pr-4 py-2 text-base font-medium text-gray-700"
            >
              依頼を作成
            </Link>
            {session ? (
              <>
                <Link
                  href="/dashboard"
                  className="block pl-3 pr-4 py-2 text-base font-medium text-gray-700"
                >
                  ダッシュボード
                </Link>
                <button
                  onClick={() => signOut()}
                  className="block w-full text-left pl-3 pr-4 py-2 text-base font-medium text-gray-700"
                >
                  ログアウト
                </button>
              </>
            ) : (
              <button
                onClick={() => signIn('google')}
                className="block w-full text-left pl-3 pr-4 py-2 text-base font-medium text-gray-700"
              >
                ログイン
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  )
} 