import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

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

      if (author) {
        // 既存ユーザー → 投票ページへ
        return NextResponse.redirect(new URL('/vote/zenki', origin))
      } else {
        // 初回 → ペンネーム選択へ
        return NextResponse.redirect(new URL('/select-penname', origin))
      }
    }
  }

  return NextResponse.redirect(new URL('/', origin))
}