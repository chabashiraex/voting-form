'use client'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const TABS = [
  { label: '前期', href: '/vote/zenki' },
  { label: '中期', href: '/vote/chuki' },
  { label: '後期', href: '/vote/koki' },
]

export default function VoteLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-lg font-bold">作品人気投票</h1>
          <button
            onClick={handleLogout}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            ログアウト
          </button>
        </div>
        {/* タブ */}
        <div className="max-w-3xl mx-auto px-4 flex gap-1 pb-2">
          {TABS.map((tab) => (
            <button
              key={tab.href}
              onClick={() => router.push(tab.href)}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition
                ${pathname === tab.href
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="max-w-3xl mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  )
}