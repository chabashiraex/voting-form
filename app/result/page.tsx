import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

const REQUIRED_VOTERS = 4

type RankingRow = {
  period_no: number
  period_name: string
  work_no: number
  work_title: string
  author_name: string
  total_score: number
  vote_count: number
  rank: number
}

const MEDAL: Record<number, string> = {
  1: '🥇',
  2: '🥈',
  3: '🥉',
}

export default async function ResultsPage() {
  const supabase = await createClient()

  // 認証確認
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/')

  // 投票完了確認
  const { data: author } = await supabase
    .from('author_master')
    .select('no')
    .eq('google_uid', user.id)
    .single()

  if (!author) redirect('/')

  const { data: myFinalizedVote } = await supabase
    .from('votes')
    .select('is_finalized')
    .eq('voter_author_no', author.no)
    .eq('is_finalized', true)
    .limit(1)
    .maybeSingle()

  if (!myFinalizedVote) redirect('/vote/zenki')

  // 全員完了確認
  const { data: finalizedVoters } = await supabase
    .from('votes')
    .select('voter_author_no')
    .eq('is_finalized', true)

  const uniqueVoters = new Set(
    finalizedVoters?.map((v) => v.voter_author_no)
  ).size

  if (uniqueVoters < REQUIRED_VOTERS) redirect('/waiting')

  // ランキング取得（上位5位まで）
  const { data: ranking } = await supabase
    .from('ranking_view_secure')
    .select('*')
    .order('period_no', { ascending: true })
    .order('rank', { ascending: true })

  // 時期ごとにグループ化
  const grouped = (ranking as RankingRow[])?.reduce(
    (acc, row) => {
      if (!acc[row.period_name]) acc[row.period_name] = []
      acc[row.period_name].push(row)
      return acc
    },
    {} as Record<string, RankingRow[]>
  )

  const periods = ['前期', '中期', '後期']

  return (
    <main className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-2xl mx-auto space-y-8">
        {/* ヘッダー */}
        <div className="text-center space-y-2">
          <div className="text-5xl">🏆</div>
          <h1 className="text-3xl font-bold">投票結果発表</h1>
          <p className="text-gray-500 text-sm">全メンバーの投票が完了しました</p>
        </div>

        {/* 時期ごとのランキング */}
        {periods.map((period) => {
          const items = grouped?.[period] ?? []
          return (
            <div key={period} className="bg-white rounded-2xl shadow p-6 space-y-4">
              <h2 className="text-xl font-bold border-b-2 border-blue-500 pb-2">
                {period}
              </h2>
              {items.length === 0 ? (
                <p className="text-gray-400 text-sm">データがありません</p>
              ) : (
                <ol className="space-y-3">
                  {items.map((item) => (
                    <li
                      key={item.work_no}
                      className={`flex items-center justify-between p-3 rounded-xl
                        ${item.rank === 1 ? 'bg-yellow-50 border border-yellow-200' :
                          item.rank === 2 ? 'bg-gray-50 border border-gray-200' :
                          item.rank === 3 ? 'bg-orange-50 border border-orange-200' :
                          'bg-white border border-gray-100'}`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl w-8 text-center">
                          {MEDAL[item.rank] ?? item.rank}
                        </span>
                        <div>
                          <p className="font-medium">{item.work_title}</p>
                          <p className="text-sm text-gray-400">{item.author_name}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-blue-600">
                          {item.total_score}
                          <span className="text-sm text-gray-400">pt</span>
                        </p>
                      </div>
                    </li>
                  ))}
                </ol>
              )}
            </div>
          )
        })}
      </div>
    </main>
  )
}