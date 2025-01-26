'use client';

import React from 'react';
import Image from 'next/legacy/image';
import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="space-y-12">
      {/* ヒーローセクション */}
      <div className="relative h-[600px] overflow-hidden rounded-xl">
        {/* 背景画像 */}
        <Image
          src="/images/hero.webp"
          alt="AIOK Hero Image"
          width={1920}
          height={1080}
          className="object-cover"
          priority
        />
        {/* オーバーレイ */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/90 to-purple-700/90" />
        {/* コンテンツ */}
        <div className="relative h-full flex flex-col items-center justify-center max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <p className="text-xl md:text-2xl mb-4 text-indigo-200 font-medium">
            AIOKなクリエイターマッチングサービス。
          </p>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            AIを味方に。<br />「全てを可能」にする<br className="md:hidden" />新しいクリエイティブスタイル
          </h1>
          <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
            <Link
              href="/requests/new"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-500 hover:bg-indigo-600 transition-colors"
            >
              依頼を作成する
            </Link>
            <Link
              href="/requests"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-indigo-200 bg-indigo-900 bg-opacity-50 hover:bg-opacity-70 transition-colors"
            >
              依頼を探す
            </Link>
          </div>
        </div>
      </div>

      {/* ナビゲーションメニュー */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6">
            <Link
              href="/profile"
              className="flex items-center justify-center p-4 rounded-lg bg-indigo-50 hover:bg-indigo-100 transition-colors"
            >
              <div className="text-center">
                <h3 className="text-lg font-medium text-indigo-900">プロフィール設定</h3>
                <p className="mt-1 text-sm text-indigo-700">プロフィールを編集する</p>
              </div>
            </Link>

            <Link
              href="/requests"
              className="flex items-center justify-center p-4 rounded-lg bg-indigo-50 hover:bg-indigo-100 transition-colors"
            >
              <div className="text-center">
                <h3 className="text-lg font-medium text-indigo-900">依頼一覧</h3>
                <p className="mt-1 text-sm text-indigo-700">依頼を確認・管理する</p>
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* 特徴セクション */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">
            AIOKの特徴
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            AIを活用したクリエイティブな依頼マッチングプラットフォーム
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {/* 特徴カード1 */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-gray-900">
                AIによる最適なマッチング
              </h3>
              <p className="mt-2 text-base text-gray-500">
                AIがクリエイターのスキルと依頼内容を分析し、最適なマッチングを提案します。
              </p>
            </div>
          </div>

          {/* 特徴カード2 */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-gray-900">
                安心の取引システム
              </h3>
              <p className="mt-2 text-base text-gray-500">
                エスクロー決済で安全な取引を実現。作品の品質を確認してから支払いが完了します。
              </p>
            </div>
          </div>

          {/* 特徴カード3 */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-gray-900">
                多彩なクリエイター
              </h3>
              <p className="mt-2 text-base text-gray-500">
                イラスト、動画編集、ウェブデザインなど、様々なジャンルのクリエイターが参加しています。
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 