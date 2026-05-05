import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// 投票完了人数の定数
const REQUIRED_VOTERS = 4

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  if (code) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.exchangeCodeForSession(code)

    if (user) {
      // google_uid紐づけ済みか確認
      const { data: author } = await supabase
        .from('author_master')
        .select('no')
        .eq('google_uid', user.id)
        .single()

      if (!author) {
        // 初回 → ペンネーム選択へ
        return NextResponse.redirect(new URL('/select-penname', origin))
      }

      // 自分が投票完了しているか確認
      const { data: myFinalizedVote } = await supabase
        .from('votes')
        .select('is_finalized')
        .eq('voter_author_no', author.no)
        .eq('is_finalized', true)
        .limit(1)
        .maybeSingle()

      if (!myFinalizedVote) {
        // 未完了 → 投票ページへ
        return NextResponse.redirect(new URL('/vote/zenki', origin))
      }

      // 全員が投票完了しているか確認
      const { data: finalizedVoters } = await supabase
        .from('votes')
        .select('voter_author_no')
        .eq('is_finalized', true)

      const uniqueVoters = new Set(
        finalizedVoters?.map((v) => v.voter_author_no)
      ).size

      if (uniqueVoters >= REQUIRED_VOTERS) {
        // 全員完了 → 結果画面へ
        return NextResponse.redirect(new URL('/results', origin))
      } else {
        // まだ全員完了していない → 待機画面へ
        return NextResponse.redirect(new URL('/waiting', origin))
      }
    }
  }

  return NextResponse.redirect(new URL('/', origin))
}