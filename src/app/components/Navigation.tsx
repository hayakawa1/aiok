'use client'

import React from 'react'
import { useState, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import Image from 'next/image'
import { Session } from 'next-auth'

interface NavigationProps {
  session: Session | null
}

export function Navigation({ session }: NavigationProps) {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [username, setUsername] = useState<string | null>(null)
  const [userImage, setUserImage] = useState<string | null>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('[data-menu-container]')) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchUser = async () => {
      if (session?.user?.email) {
        try {
          const response = await fetch('/api/users/profile')
          if (response.ok) {
            const data = await response.json()
            setUsername(data.username)
            setUserImage(data.image)
          }
        } catch (error) {
          console.error('Error fetching user:', error)
        }
      }
    }

    fetchUser()
  }, [session])

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between h-16">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <Link href="/" className="text-xl font-bold text-blue-600 flex items-center gap-2">
              <span className="material-symbols-outlined">diversity_3</span>
              AIOK
            </Link>
          </div>
          
          <div className="hidden md:ml-8 md:flex md:space-x-4">
            <Link href="/search" 
              className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors">
              <span className="material-symbols-outlined mr-2">search</span>
              探す
            </Link>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          {session?.user ? (
            <div className="relative">
              <button type="button" 
                onClick={(e) => {
                  e.stopPropagation();
                  setIsUserMenuOpen(!isUserMenuOpen);
                }}
                data-menu-container
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 p-2 rounded-full hover:bg-gray-50 transition-colors">
                <Image
                  src={userImage || session.user.image || '/images/default-avatar.svg'}
                  alt="プロフィール画像"
                  width={32}
                  height={32}
                  className="rounded-full"
                />
                <span className="material-symbols-outlined">expand_more</span>
              </button>
              
              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 z-50"
                     data-menu-container>
                  <div className="py-1">
                    <Link href={username ? `/${username}` : '/profile'}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      <span className="material-symbols-outlined align-middle mr-2">preview</span>
                      プロフィール確認
                    </Link>
                    <Link href="/profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      <span className="material-symbols-outlined align-middle mr-2">person</span>
                      プロフィール編集
                    </Link>
                    <Link href="/settings"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      <span className="material-symbols-outlined align-middle mr-2">settings</span>
                      アカウント設定
                    </Link>
                    <Link href="/price-plans"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      <span className="material-symbols-outlined align-middle mr-2">payments</span>
                      料金プラン
                    </Link>
                    <Link href="/requests"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      <span className="material-symbols-outlined align-middle mr-2">history</span>
                      依頼履歴
                    </Link>
                    <button
                      onClick={() => signOut()}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      <span className="material-symbols-outlined align-middle mr-2">logout</span>
                      ログアウト
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link href="/api/auth/signin"
              className="nav-link nav-link-inactive">
              <span className="material-symbols-outlined">login</span>
              Googleでログイン
            </Link>
          )}
        </div>
      </div>
      
      {/* モバイルメニュー */}
      <div className={`md:hidden ${isMobileMenuOpen ? '' : 'hidden'}`}>
        <div className="px-2 pt-2 pb-3 space-y-1">
          <Link href="/search" 
            className="nav-link">
            <span className="material-symbols-outlined">search</span>
            探す
          </Link>
          
          {session?.user ? (
            <>
              <Link href="/requests" 
                className="nav-link">
                <span className="material-symbols-outlined">history</span>
                依頼履歴
              </Link>
            </>
          ) : (
            <Link href="/api/auth/signin"
              className="nav-link nav-link-inactive">
              <span className="material-symbols-outlined">login</span>
              Googleでログイン
            </Link>
          )}
        </div>
      </div>
    </div>
  )
} 