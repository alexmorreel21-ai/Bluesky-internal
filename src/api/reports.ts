import { jsonRequest, requestJson } from './http'

export type ReportLine = {
  assignmentId: string
  assignmentTitle: string
  workDone: string
}

export type ReportEntry = {
  id: string
  date: string
  teamId: string
  teamName: string
  createdAt: string
  lines: ReportLine[]
  note?: string
}

export type ReportPayload = {
  date: string
  teamId: string
  teamName: string
  lines: ReportLine[]
  note?: string
}

const STORAGE_KEY = 'bluesky_reports_mock_v1'

function getStoredReports(): ReportEntry[] {
  if (typeof window === 'undefined') {
    return []
  }

  const raw = window.localStorage.getItem(STORAGE_KEY)
  if (!raw) {
    return []
  }

  try {
    const parsed = JSON.parse(raw) as ReportEntry[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function setStoredReports(items: ReportEntry[]): void {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
}

export async function fetchReports(): Promise<ReportEntry[]> {
  try {
    return await requestJson<ReportEntry[]>('/api/reports', { method: 'GET' })
  } catch {
    return getStoredReports()
  }
}

export async function createReport(payload: ReportPayload): Promise<ReportEntry> {
  try {
    return await requestJson<ReportEntry>('/api/reports', jsonRequest(payload, { method: 'POST' }))
  } catch {
    const nextItem: ReportEntry = {
      id: crypto.randomUUID(),
      ...payload,
      createdAt: new Date().toISOString(),
    }

    const nextItems = [nextItem, ...getStoredReports()]
    setStoredReports(nextItems)
    return nextItem
  }
}
