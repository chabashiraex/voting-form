'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { AuthorMaster } from '@/lib/types'

export default function SelectPennamePage() {
  const supabase = createClient()
  const router = useRouter()
  const [authors, setAuthors] = useState<AuthorMaster[]>([])
  const [selected, setSelected] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchAuthors = async () => {
      // google_uid未紐づけのペンネームのみ取得
      const { data } = await supabase
        .from('author_master')
        .select('*')
        .is('google_uid', null)
      if (data) setAuthors(data)
    }
    fetchAuthors()
  }, [])

  const handleSubmit = async () => {
    if (!selected) return
    setLoading(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase
      .from('author_master')
      .update({ google_uid: user.id })
      .eq('no', selected)

    if (!error) {
      router.push('/vote/zenki')
    } else {
      alert('エラーが発生しました。再度お試しください。')
      setLoading(false)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="bg-white p-10 rounded-2xl shadow w-full max-w-md space-y-6">
        <h1 className="text-xl font-bold text-center">ペンネームを選択してください</h1>
        <p className="text-sm text-gray-500 text-center">
          一度選択すると変更できません
        </p>
        <ul className="space-y-2">
          {authors.map((author) => (
            <li key={author.no}>
              <label className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition
                ${selected === author.no
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:bg-gray-50'}`}
              >
                <input
                  type="radio"
                  name="penname"
                  value={author.no}
                  onChange={() => setSelected(author.no)}
                  className="accent-blue-600"
                />
                <span className="font-medium">{author.pen_name}</span>
              </label>
            </li>
          ))}
        </ul>
        <button
          onClick={handleSubmit}
          disabled={!selected || loading}
          className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 
                     disabled:opacity-40 disabled:cursor-not-allowed transition"
        >
          {loading ? '処理中...' : 'このペンネームで投票する'}
        </button>
      </div>
    </main>
  )
}