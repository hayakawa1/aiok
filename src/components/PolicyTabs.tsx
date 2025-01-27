'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import clsx from 'clsx'

const tabs = [
  { name: '利用規約', href: '/terms' },
  { name: '特定商取引法に基づく表記', href: '/commerce' },
  { name: 'ガイドライン', href: '/guidelines' },
  { name: 'プライバシーポリシー', href: '/privacy' },
]

export default function PolicyTabs() {
  const pathname = usePathname()

  return (
    <div className="border-b border-gray-200">
      <nav className="-mb-px flex space-x-8" aria-label="ポリシー">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href || pathname === `/(policies)${tab.href}`
          return (
            <Link
              key={tab.name}
              href={tab.href}
              className={clsx(
                isActive
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700',
                'border-b-2 py-4 px-1 text-sm font-medium'
              )}
              aria-current={isActive ? 'page' : undefined}
            >
              {tab.name}
            </Link>
          )
        })}
      </nav>
    </div>
  )
} 