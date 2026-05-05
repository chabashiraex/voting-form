'use client'
import { useVote } from '@/lib/hooks/useVote'

const SCORE_OPTIONS = [
  { value: 0, label: '−', isExcluded: true },
  { value: 1, label: '1' },
  { value: 2, label: '2' },
  { value: 3, label: '3' },
  { value: 4, label: '4' },
  { value: 5, label: '5' },
]

type Props = {
  periodNo: number
  isLastPeriod?: boolean
}

export default function VoteForm({ periodNo, isLastPeriod = false }: Props) {
  const {
    works, scores, myAuthorNo, isFinalized,
    loading, saving, handleScore, handleSave, handleFinalize,
  } = useVote(periodNo)

  if (loading) {
    return <div className="text-center py-20 text-gray-400">読み込み中...</div>
  }

  if (isFinalized) {
    return (
      <div className="text-center py-20 text-gray-500">
        <p className="text-lg font-medium">投票は完了済みです</p>
        <p className="text-sm mt-2">ご参加ありがとうございました。</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 作品リスト */}
      <div className="space-y-3">
        {works.map((work, index) => {
          const isOwn = work.author_no === myAuthorNo
          const currentScore = scores[work.no] ?? null
          // 最初の作品、または前の作品と収録本が異なる場合にヘッダーを表示
          const showBookHeader =
            index === 0 ||
            works[index - 1].book_no !== work.book_no

          return (
            <div key={work.no}>
              {/* 収録本ヘッダー */}
              {showBookHeader && (
                <div className="mt-6 mb-2 first:mt-0">
                  <h2 className="text-base font-bold text-gray-700 border-b-2 border-blue-500 pb-1">
                    📖 {work.book_master?.title}
                  </h2>
                </div>
              )}

              {/* 作品カード */}
              <div
                className={`bg-white rounded-xl border p-4 ${isOwn ? 'opacity-50' : ''}`}
              >
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div>
                    <p className="font-medium">{work.title}</p>
                    <p className="text-sm text-gray-400 mt-0.5">
                      {work.author_master?.pen_name}
                    </p>
                  </div>

                  <div className="flex items-center gap-1">
                    {SCORE_OPTIONS.map((opt) => {
                      const isSelected = opt.isExcluded
                        ? currentScore === null
                        : currentScore === opt.value

                      return (
                        <label
                          key={opt.value}
                          className={`flex flex-col items-center cursor-pointer
                            ${isOwn ? 'pointer-events-none' : ''}`}
                        >
                          <input
                            type="radio"
                            name={`work-${work.no}`}
                            value={opt.value}
                            checked={isSelected}
                            disabled={isOwn}
                            onChange={() => {
                              if (!opt.isExcluded) handleScore(work.no, opt.value)
                            }}
                            className="sr-only"
                          />
                          <span className={`w-9 h-9 flex items-center justify-center 
                            rounded-full text-sm font-medium border-2 transition
                            ${isOwn
                              ? 'border-gray-200 text-gray-300 bg-gray-50'
                              : isSelected
                                ? opt.isExcluded
                                  ? 'border-gray-400 bg-gray-100 text-gray-600'
                                  : 'border-blue-500 bg-blue-500 text-white'
                                : 'border-gray-200 text-gray-600 hover:border-blue-300'
                            }`}
                          >
                            {opt.label}
                          </span>
                        </label>
                      )
                    })}
                  </div>
                </div>
                {isOwn && (
                  <p className="text-xs text-gray-400 mt-2">※ 自作品のため投票対象外</p>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* ボタンエリア */}
      <div className="flex gap-3 justify-end pt-2">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2.5 rounded-lg border border-gray-300 text-sm 
                     font-medium hover:bg-gray-50 disabled:opacity-40 transition"
        >
          {saving ? '保存中...' : '一時保存'}
        </button>
        {isLastPeriod && (
          <button
            onClick={handleFinalize}
            disabled={saving}
            className="px-6 py-2.5 rounded-lg bg-blue-600 text-white text-sm 
                       font-medium hover:bg-blue-700 disabled:opacity-40 transition"
          >
            投票完了
          </button>
        )}
      </div>
    </div>
  )
}