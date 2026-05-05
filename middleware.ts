import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // セッションを自動更新
  const { data: { user } } = await supabase.auth.getUser()

  // 未ログインで保護されたページにアクセスした場合はトップへ
  if (!user && (
    request.nextUrl.pathname.startsWith('/vote') ||
    request.nextUrl.pathname.startsWith('/complete') ||
    request.nextUrl.pathname.startsWith('/select-penname') ||
    request.nextUrl.pathname.startsWith('/results') ||
    request.nextUrl.pathname.startsWith('/waiting')
  )) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  // ログイン済みでトップページにアクセスした場合は投票ページへ
  if (user && request.nextUrl.pathname === '/') {
    return NextResponse.redirect(new URL('/vote/zenki', request.url))
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}