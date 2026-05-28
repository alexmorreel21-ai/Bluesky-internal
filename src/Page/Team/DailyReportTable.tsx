import type { DailyReportEntry } from '../../api/dailyReports'

type DailyReportTableProps = {
  isLoading: boolean
  title: string
  description: string
  reports: DailyReportEntry[]
  emptyMessage: string
  resolveReportHtml: (report: DailyReportEntry) => string
  onView: (report: DailyReportEntry) => void
  onEdit: (report: DailyReportEntry) => void
  onDelete: (reportId: string) => void
}

function DailyReportTable({
  isLoading,
  title,
  description,
  reports,
  emptyMessage,
  resolveReportHtml,
  onView,
  onEdit,
  onDelete,
}: DailyReportTableProps) {
  return (
    <section className="daily-report-list" aria-label="Filtered daily reports">
      <h2>{title}</h2>
      <p className="daily-report-sub">{description}</p>
      {isLoading ? (
        <p>Loading daily reports...</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Date &amp; Time</th>
              <th>Team</th>
              <th>Report</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {reports.length === 0 ? (
              <tr>
                <td className="daily-report-empty-cell" colSpan={4}>
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              reports.map((report) => (
                <tr key={report.id}>
                  <td>
                    {new Date(report.createdAt).toLocaleString([], {
                      year: 'numeric',
                      month: 'short',
                      day: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </td>
                  <td>{report.teamName}</td>
                  <td>
                    <div
                      className="daily-report-rendered-content"
                      dangerouslySetInnerHTML={{ __html: resolveReportHtml(report) }}
                    />
                  </td>
                  <td>
                    <div className="daily-report-row-actions">
                      <button type="button" className="daily-report-row-view" onClick={() => onView(report)}>
                        View
                      </button>
                      <button type="button" className="daily-report-row-edit" onClick={() => onEdit(report)}>
                        Edit
                      </button>
                      <button type="button" className="delete-account-button" onClick={() => onDelete(report.id)}>
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}
    </section>
  )
}

export default DailyReportTable