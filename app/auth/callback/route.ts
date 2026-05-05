import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

const REQUIRED_VOTERS = 4

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  if (code) {
    const supabase = await createClient()
    await supabase.auth.exchangeCodeForSession(code)

    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
      const { data: author } = await supabase
        .from('author_master')
        .select('no')
        .eq('google_uid', user.id)
        .single()

      if (!author) {
        return NextResponse.redirect(new URL('/select-penname', origin))
      }

      const { data: myFinalizedVote } = await supabase
        .from('votes')
        .select('is_finalized')
        .eq('voter_author_no', author.no)
        .eq('is_finalized', true)
        .limit(1)
        .maybeSingle()

      if (!myFinalizedVote) {
        return NextResponse.redirect(new URL('/vote/zenki', origin))
      }

      const { data: finalizedVoters } = await supabase
        .from('votes')
        .select('voter_author_no')
        .eq('is_finalized', true)

      const uniqueVoters = new Set(
        finalizedVoters?.map((v) => v.voter_author_no)
      ).size

      if (uniqueVoters >= REQUIRED_VOTERS) {
        return NextResponse.redirect(new URL('/results', origin))
      } else {
        return NextResponse.redirect(new URL('/waiting', origin))
      }
    }
  }

  return NextResponse.redirect(new URL('/', origin))
}