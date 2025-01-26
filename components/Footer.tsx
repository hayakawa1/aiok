import Link from 'next/link'

export function Footer() {
  return (
    <footer className="bg-white border-t">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* サービス情報 */}
          <div className="col-span-1">
            <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">
              サービス情報
            </h3>
            <ul className="mt-4 space-y-4">
              <li>
                <Link
                  href="/about"
                  className="text-base text-gray-500 hover:text-gray-900"
                >
                  AIOKについて
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="text-base text-gray-500 hover:text-gray-900"
                >
                  利用規約
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="text-base text-gray-500 hover:text-gray-900"
                >
                  プライバシーポリシー
                </Link>
              </li>
            </ul>
          </div>

          {/* 依頼 */}
          <div className="col-span-1">
            <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">
              依頼
            </h3>
            <ul className="mt-4 space-y-4">
              <li>
                <Link
                  href="/requests"
                  className="text-base text-gray-500 hover:text-gray-900"
                >
                  依頼を探す
                </Link>
              </li>
              <li>
                <Link
                  href="/requests/new"
                  className="text-base text-gray-500 hover:text-gray-900"
                >
                  依頼を作成
                </Link>
              </li>
            </ul>
          </div>

          {/* サポート */}
          <div className="col-span-1">
            <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">
              サポート
            </h3>
            <ul className="mt-4 space-y-4">
              <li>
                <Link
                  href="/help"
                  className="text-base text-gray-500 hover:text-gray-900"
                >
                  ヘルプセンター
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-base text-gray-500 hover:text-gray-900"
                >
                  お問い合わせ
                </Link>
              </li>
            </ul>
          </div>

          {/* 会社情報 */}
          <div className="col-span-1">
            <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">
              会社情報
            </h3>
            <ul className="mt-4 space-y-4">
              <li>
                <Link
                  href="/company"
                  className="text-base text-gray-500 hover:text-gray-900"
                >
                  会社概要
                </Link>
              </li>
              <li>
                <Link
                  href="/news"
                  className="text-base text-gray-500 hover:text-gray-900"
                >
                  ニュース
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-gray-200 pt-8">
          <p className="text-base text-gray-400 text-center">
            &copy; {new Date().getFullYear()} AIOK. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
} 