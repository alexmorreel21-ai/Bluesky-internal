import { format, startOfWeek } from 'date-fns'
import type { DailyReport, ReportFilter } from '../../types/report.types'
import type { Task } from '../../types/task.types'
import type { Team } from '../../types/team.types'
import type { User } from '../../types/user.types'
import { STORAGE_KEYS, apiHandler, generateId } from './base'
import { readStorage, writeStorage } from './storage'

function now(): string {
  return new Date().toISOString()
}

function getReportsRaw(): DailyReport[] {
  const rawReports = readStorage<DailyReport[]>(STORAGE_KEYS.REPORTS, [])
  const tasks = readStorage<Task[]>(STORAGE_KEYS.TASKS, [])

  // Normalize legacy report entries so old localStorage payloads remain readable.
  return rawReports.map((report) => ({
    ...report,
    entries: report.entries.map((entry) => {
      const task = tasks.find((item) => item.id === entry.taskId)
      const legacyScore = Number((entry as ReportEntryLegacy).score ?? 0)
      const completedValue = Number((entry as ReportEntryLegacy).completedValue ?? legacyScore)
      const referenceValue = Number((entry as ReportEntryLegacy).referenceValue ?? task?.objective ?? 100)
      const completedPercentage =
        referenceValue > 0
          ? Number((((entry as ReportEntryLegacy).completedPercentage ?? (completedValue / referenceValue) * 100)).toFixed(2))
          : 0

      return {
        taskId: entry.taskId,
        taskName: entry.taskName,
        completedValue,
        referenceValue,
        completedPercentage,
      }
    }),
  }))
}

type ReportEntryLegacy = {
  taskId: string
  taskName: string
  completedValue?: number
  referenceValue?: number
  completedPercentage?: number
  score?: number
}

function setReportsRaw(reports: DailyReport[]): void {
  writeStorage(STORAGE_KEYS.REPORTS, reports)
}

function weekStart(dateKey: string): string {
  return format(startOfWeek(new Date(dateKey), { weekStartsOn: 1 }), 'yyyy-MM-dd')
}

export const getReports = async (): Promise<DailyReport[]> =>
  apiHandler(() => [...getReportsRaw()].sort((a, b) => b.date.localeCompare(a.date)))

export const getReportById = async (id: string): Promise<DailyReport | null> =>
  apiHandler(() => getReportsRaw().find((item) => item.id === id) ?? null)

export const getReportsByDate = async (date: string): Promise<DailyReport[]> =>
  apiHandler(() => getReportsRaw().filter((item) => item.date === date))

export const getReportsByWeek = async (weekStartDate: string): Promise<DailyReport[]> =>
  apiHandler(() => getReportsRaw().filter((item) => weekStart(item.date) === weekStartDate))

export const getReportsByTeam = async (teamId: string): Promise<DailyReport[]> =>
  apiHandler(() => getReportsRaw().filter((item) => item.teamId === teamId))

export const getReportsByAuthor = async (authorId: string): Promise<DailyReport[]> =>
  apiHandler(() => getReportsRaw().filter((item) => item.authorId === authorId))

export const submitReport = async (
  reportData: Omit<DailyReport, 'id' | 'teamName' | 'authorName' | 'createdAt' | 'updatedAt'>,
): Promise<DailyReport> =>
  apiHandler(() => {
    const teams = readStorage<Team[]>(STORAGE_KEYS.TEAMS, [])
    const users = readStorage<User[]>(STORAGE_KEYS.USERS, [])
    const reports = getReportsRaw()

    if (reports.some((item) => item.date === reportData.date && item.authorId === reportData.authorId)) {
      throw new Error('You already submitted a report for this date.')
    }

    const teamName = teams.find((item) => item.id === reportData.teamId)?.name ?? 'Unknown Team'
    const authorName = users.find((item) => item.id === reportData.authorId)?.username ?? 'Unknown User'
    const createdAt = now()

    const nextReport: DailyReport = {
      id: generateId('report'),
      ...reportData,
      teamName,
      authorName,
      createdAt,
      updatedAt: createdAt,
    }

    setReportsRaw([...reports, nextReport])
    return nextReport
  })

export const updateReport = async (
  id: string,
  updates: Partial<Pick<DailyReport, 'entries' | 'globalNotes'>>,
): Promise<DailyReport> =>
  apiHandler(() => {
    const reports = getReportsRaw()
    const target = reports.find((item) => item.id === id)
    if (!target) {
      throw new Error('Report not found.')
    }

    const updated: DailyReport = { ...target, ...updates, updatedAt: now() }
    setReportsRaw(reports.map((item) => (item.id === id ? updated : item)))
    return updated
  })

export const deleteReport = async (id: string): Promise<void> =>
  apiHandler(() => {
    const reports = getReportsRaw()
    setReportsRaw(reports.filter((item) => item.id !== id))
  })

export const getFilteredReports = async (filter: ReportFilter): Promise<DailyReport[]> =>
  apiHandler(() => {
    const reports = getReportsRaw()

    if (filter.type === 'day' && filter.date) {
      return reports.filter((item) => item.date === filter.date)
    }

    if (filter.type === 'week' && filter.weekStart) {
      return reports.filter((item) => weekStart(item.date) === filter.weekStart)
    }

    return reports
  })

export const getReportSummary = async (): Promise<{ today: number; thisWeek: number; total: number }> =>
  apiHandler(() => {
    const reports = getReportsRaw()
    const today = new Date().toISOString().slice(0, 10)
    const currentWeek = weekStart(today)

    return {
      today: reports.filter((item) => item.date === today).length,
      thisWeek: reports.filter((item) => weekStart(item.date) === currentWeek).length,
      total: reports.length,
    }
  })
