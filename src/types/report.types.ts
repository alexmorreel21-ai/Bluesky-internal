export interface ReportEntry {
  taskId: string
  taskName: string
  done: string
}

export interface DailyReport {
  id: string
  date: string
  teamId: string
  teamName: string
  authorId: string
  authorName: string
  entries: ReportEntry[]
  globalNotes?: string
  createdAt: string
  updatedAt: string
}

export type ReportFilterType = 'day' | 'week'

export interface ReportFilter {
  type: ReportFilterType
  date?: string
  weekStart?: string
}
