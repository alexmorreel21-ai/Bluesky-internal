import type { DailyReportEntry } from '../../api/dailyReports'

export function getTodayDateKey(): string {
  return new Date().toISOString().slice(0, 10)
}

export function parseDateKey(dateKey: string): Date {
  const [year = 1970, month = 1, day = 1] = dateKey.split('-').map(Number)
  return new Date(year, month - 1, day)
}

export function formatDateKey(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export function resolveReportHtml(report: DailyReportEntry): string {
  if (report.reportHtml?.trim()) {
    return report.reportHtml
  }

  const sections = [
    report.summary ? `<p><strong>Summary:</strong> ${report.summary}</p>` : '',
    report.progress ? `<p><strong>Progress:</strong> ${report.progress}</p>` : '',
    report.blockers ? `<p><strong>Blockers:</strong> ${report.blockers}</p>` : '',
  ].filter(Boolean)

  return sections.length > 0 ? sections.join('') : '<p>No details provided.</p>'
}