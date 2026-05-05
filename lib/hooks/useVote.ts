import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Work, Vote } from '@/lib/types'

const supabase = createClient()

export function useVote(periodNo: number) {
  const router = useRouter()

  const [works, setWorks] = useState<Work[]>([])
  const [scores, setScores] = useState<Record<number, number | null>>({})
  const [myAuthorNo, setMyAuthorNo] = useState<number | null>(null)
  const [isFinalized, setIsFinalized] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // 自分のauthor_noを取得
      const { data: author } = await supabase
        .from('author_master')
        .select('no')
        .eq('google_uid', user.id)
        .single()
      if (!author) return
      setMyAuthorNo(author.no)

      // 投票完了チェック
      const { data: finalizedVote } = await supabase
        .from('votes')
        .select('is_finalized')
        .eq('voter_author_no', author.no)
        .eq('is_finalized', true)
        .limit(1)
        .maybeSingle()
      if (finalizedVote) {
        setIsFinalized(true)
      }

      // 該当期のbook_no一覧を取得
      const { data: bookData, error: bookError } = await supabase
        .from('book_master')
        .select('no')
        .eq('period_no', periodNo)

      console.log('periodNo:', periodNo)
      console.log('bookData:', bookData)
      console.log('bookError:', bookError)

      const bookNos = bookData?.map((b) => b.no) ?? []
      console.log('bookNos:', bookNos)

      // 該当期の作品取得
      const { data: worksData, error: worksError } = await supabase
        .from('works')
        .select(`
          *,
          author_master(no, pen_name),
          book_master(no, title, period_no)
        `)
        .in('book_no', bookNos)
        .order('book_no', { ascending: true })

      console.log('worksData:', worksData)
      console.log('worksError:', worksError)

      if (worksData) setWorks(worksData)

      // 一時保存データ取得
      const { data: savedVotes } = await supabase
        .from('votes')
        .select('work_no, score')
        .eq('voter_author_no', author.no)
      if (savedVotes) {
        const map: Record<number, number | null> = {}
        savedVotes.forEach((v: Pick<Vote, 'work_no' | 'score'>) => {
          map[v.work_no] = v.score
        })
        setScores(map)
      }

      setLoading(false)
    }
    init()
  }, [periodNo])

  const handleScore = (workNo: number, score: number) => {
    if (isFinalized) return
    setScores((prev) => ({ ...prev, [workNo]: score }))
  }

  const handleSave = async () => {
    if (!myAuthorNo || isFinalized) return
    setSaving(true)

    const upsertData = Object.entries(scores)
      .filter(([, score]) => score !== null)
      .map(([workNo, score]) => ({
        voter_author_no: myAuthorNo,
        work_no: Number(workNo),
        score,
        is_finalized: false,
        updated_at: new Date().toISOString(),
      }))

    const { error } = await supabase.from('votes').upsert(upsertData, {
      onConflict: 'voter_author_no,work_no',
    })

    setSaving(false)
    if (error) {
      alert('保存に失敗しました。')
    } else {
      alert('一時保存しました。')
    }
  }

  const handleFinalize = async () => {
    if (!myAuthorNo || isFinalized) return
    const confirm = window.confirm('投票を完了しますか？完了後は変更できません。')
    if (!confirm) return
    setSaving(true)

    const upsertData = Object.entries(scores)
      .filter(([, score]) => score !== null)
      .map(([workNo, score]) => ({
        voter_author_no: myAuthorNo,
        work_no: Number(workNo),
        score,
        is_finalized: true,
        updated_at: new Date().toISOString(),
      }))

    const { error } = await supabase.from('votes').upsert(upsertData, {
      onConflict: 'voter_author_no,work_no',
    })

    setSaving(false)
    if (error) {
      alert('投票完了処理に失敗しました。')
    } else {
      router.push('/complete')
    }
  }

  return {
    works,
    scores,
    myAuthorNo,
    isFinalized,
    loading,
    saving,
    handleScore,
    handleSave,
    handleFinalize,
  }
}
