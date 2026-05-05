'use client'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const supabase = createClient()

  const handleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${location.origin}/auth/callback`,
      },
    })
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="bg-white p-10 rounded-2xl shadow text-center space-y-6">
        <h1 className="text-2xl font-bold">作品人気投票</h1>
        <p className="text-gray-500 text-sm">Googleアカウントでログインしてください</p>
        <button
          onClick={handleLogin}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
        >
          Googleでログイン
        </button>
      </div>
    </main>
  )
}