import { createClient } from '@/lib/supabase/server'

const REQUIRED_VOTERS = 4

export default async function WaitingPage() {
  const supabase = await createClient()

  const { data: finalizedVoters } = await supabase
    .from('votes')
    .select('voter_author_no')
    .eq('is_finalized', true)

  const uniqueVoters = new Set(
    finalizedVoters?.map((v) => v.voter_author_no)
  ).size

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="bg-white p-10 rounded-2xl shadow text-center space-y-4 max-w-md w-full">
        <div className="text-5xl">⏳</div>
        <h1 className="text-2xl font-bold">集計待ち中...</h1>
        <p className="text-gray-500 text-sm">
          他のメンバーの投票が完了するまでお待ちください
        </p>
        <div className="bg-gray-50 rounded-xl p-4">
          <p className="text-sm text-gray-500">投票完了人数</p>
          <p className="text-3xl font-bold text-blue-600 mt-1">
            {uniqueVoters}
            <span className="text-lg text-gray-400"> / {REQUIRED_VOTERS}人</span>
          </p>
        </div>
        <p className="text-xs text-gray-400">
          全員が投票完了したら次回ログイン時に結果が表示されます
        </p>
      </div>
    </main>
  )
}