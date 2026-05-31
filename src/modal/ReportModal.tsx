import type { FormEventHandler } from 'react'
import type { AssignmentRecord } from '../api/assignments'
import type { ReportEntry, ReportLine } from '../api/reports'

type ReportModalProps = {
  isOpen: boolean
  mode: 'create' | 'view'
  dateLabel: string
  teamOptions: Array<{ id: string; name: string }>
  selectedTeamId: string
  onSelectedTeamIdChange: (value: string) => void
  weeklyAssignments: AssignmentRecord[]
  lineMap: Record<string, string>
  onLineChange: (assignmentId: string, value: string) => void
  note: string
  onNoteChange: (value: string) => void
  onClose: () => void
  onSubmit: FormEventHandler<HTMLFormElement>
  activeReport: ReportEntry | null
}

function buildViewLines(report: ReportEntry): ReportLine[] {
  return report.lines.filter((line) => line.workDone.trim().length > 0)
}

function ReportModal({
  isOpen,
  mode,
  dateLabel,
  teamOptions,
  selectedTeamId,
  onSelectedTeamIdChange,
  weeklyAssignments,
  lineMap,
  onLineChange,
  note,
  onNoteChange,
  onClose,
  onSubmit,
  activeReport,
}: ReportModalProps) {
  if (!isOpen) {
    return null
  }

  const isViewMode = mode === 'view'

  return (
    <div className="user-mgmt-modal-backdrop" role="presentation">
      <section className="report-modal" aria-label="Report modal" role="dialog" aria-modal="true">
        <header className="daily-report-modal-head">
          <h2>{isViewMode ? 'Daily Report Details' : 'Write Daily Report'}</h2>
          <button type="button" className="user-mgmt-modal-close" onClick={onClose}>
            Close
          </button>
        </header>

        {isViewMode && activeReport ? (
          <div className="report-modal-body">
            <p className="report-meta-line">
              <strong>Date:</strong> {activeReport.date} <strong>Team:</strong> {activeReport.teamName}
            </p>
            <ol className="report-line-list">
              {buildViewLines(activeReport).map((line) => (
                <li key={line.assignmentId}>
                  <strong>{line.assignmentTitle}</strong>
                  <p>{line.workDone}</p>
                </li>
              ))}
            </ol>
            {activeReport.note && <p className="report-note-box">{activeReport.note}</p>}
          </div>
        ) : (
          <form className="report-modal-form" onSubmit={onSubmit}>
            <div className="report-meta-row">
              <label htmlFor="reportTeam">Team</label>
              <select id="reportTeam" value={selectedTeamId} onChange={(event) => onSelectedTeamIdChange(event.target.value)} required>
                <option value="">Select team</option>
                {teamOptions.map((team) => (
                  <option key={team.id} value={team.id}>
                    {team.name}
                  </option>
                ))}
              </select>
              <span className="report-date-pill">{dateLabel}</span>
            </div>

            <h3>Weekly assignments</h3>
            <div className="report-line-editor-wrap">
              {weeklyAssignments.length === 0 ? (
                <p className="user-mgmt-sub">No assignments for this team this week. You can still write notes.</p>
              ) : (
                weeklyAssignments.map((assignment) => (
                  <div className="report-line-editor" key={assignment.id}>
                    <label htmlFor={`line-${assignment.id}`}>{assignment.taskName}</label>
                    <textarea
                      id={`line-${assignment.id}`}
                      value={lineMap[assignment.id] ?? ''}
                      onChange={(event) => onLineChange(assignment.id, event.target.value)}
                      placeholder="What did you complete today?"
                    />
                  </div>
                ))
              )}
            </div>

            <label htmlFor="reportNote">Additional note</label>
            <textarea
              id="reportNote"
              className="assignment-textarea"
              value={note}
              onChange={(event) => onNoteChange(event.target.value)}
              placeholder="Optional summary or blocker"
            />

            <div className="user-mgmt-modal-actions">
              <button type="button" className="user-mgmt-modal-cancel" onClick={onClose}>
                Cancel
              </button>
              <button type="submit">Post report</button>
            </div>
          </form>
        )}
      </section>
    </div>
  )
}

export default ReportModal
