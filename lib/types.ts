export type PeriodMaster = {
  no: number
  name: string
}

export type BookMaster = {
  no: number
  title: string
  period_no: number
}

export type AuthorMaster = {
  no: number
  pen_name: string
  google_uid: string | null
}

export type Work = {
  no: number
  title: string
  author_no: number
  book_no: number
  // JOIN用
  author_master?: AuthorMaster
  book_master?: BookMaster & { period_master?: PeriodMaster }
}

export type Vote = {
  id: string
  voter_author_no: number
  work_no: number
  score: number | null
  is_finalized: boolean
  updated_at: string
}