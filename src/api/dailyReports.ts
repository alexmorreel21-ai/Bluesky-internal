import { jsonRequest, requestJson } from './http'

export type DailyReportEntry = {
  id: string
  date: string
  teamName: string
  reportHtml: string
  createdAt: string
  summary?: string
  progress?: string
  blockers?: string
}

export type DailyReportPayload = {
  date: string
  teamId?: string
  teamName?: string
  reportHtml: string
}

export type DailyReportTeamOption = {
  id: string
  name: string
}

export async function fetchDailyReports(): Promise<DailyReportEntry[]> {
  return requestJson<DailyReportEntry[]>('/api/daily-reports', { method: 'GET' })
}

export async function createDailyReport(payload: DailyReportPayload): Promise<DailyReportEntry> {
  return requestJson<DailyReportEntry>('/api/daily-reports', jsonRequest(payload, { method: 'POST' }))
}

export async function updateDailyReport(
  reportId: string,
  payload: Pick<DailyReportPayload, 'reportHtml'>,
): Promise<DailyReportEntry> {
  return requestJson<DailyReportEntry>(
    `/api/daily-reports/${encodeURIComponent(reportId)}`,
    jsonRequest(payload, { method: 'PUT' }),
  )
}

export async function deleteDailyReport(reportId: string): Promise<void> {
  return requestJson<void>(`/api/daily-reports/${encodeURIComponent(reportId)}`, { method: 'DELETE' })
}

export async function fetchDailyReportTeams(): Promise<DailyReportTeamOption[]> {
  const teams = await requestJson<Array<{ id?: string; name?: string }>>('/api/teams', { method: 'GET' })

  return teams
    .map((team) => ({ id: team.id ?? '', name: team.name ?? '' }))
    .filter((team) => team.id && team.name)
}