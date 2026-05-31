import { useEffect, useMemo, useState } from 'react'
import { endOfWeek, startOfWeek } from 'date-fns'
import { fetchAssignmentTeams, fetchAssignments, type AssignmentRecord } from '../../api/assignments'
import { createReport, fetchReports, type ReportEntry } from '../../api/reports'
import FeedbackMessages from '../../components/FeedbackMessages'
import ReportModal from '../../modal/ReportModal'

function getDateKey(value = new Date()): string {
  const year = value.getFullYear()
  const month = String(value.getMonth() + 1).padStart(2, '0')
  const day = String(value.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function parseDateKey(value: string): Date {
  const [year = 1970, month = 1, day = 1] = value.split('-').map(Number)
  return new Date(year, month - 1, day)
}

function ReportPage() {
  const [reports, setReports] = useState<ReportEntry[]>([])
  const [assignments, setAssignments] = useState<AssignmentRecord[]>([])
  const [teams, setTeams] = useState<Array<{ id: string; name: string }>>([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [reportView, setReportView] = useState<'day' | 'week'>('day')
  const [selectedDate, setSelectedDate] = useState(getDateKey())
  const [selectedTeamFilter, setSelectedTeamFilter] = useState('all')

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<'create' | 'view'>('create')
  const [activeReport, setActiveReport] = useState<ReportEntry | null>(null)
  const [selectedTeamId, setSelectedTeamId] = useState('')
  const [lineMap, setLineMap] = useState<Record<string, string>>({})
  const [note, setNote] = useState('')

  useEffect(() => {
    let isMounted = true

    async function loadData() {
      try {
        const [reportItems, assignmentItems, teamItems] = await Promise.all([
          fetchReports(),
          fetchAssignments(),
          fetchAssignmentTeams(),
        ])

        if (!isMounted) {
          return
        }

        setReports(reportItems)
        setAssignments(assignmentItems)
        setTeams(teamItems)
      } catch {
        if (!isMounted) {
          return
        }

        setErrorMessage('Failed to load report data from backend API.')
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    void loadData()

    return () => {
      isMounted = false
    }
  }, [])

  const selectedDateValue = useMemo(() => parseDateKey(selectedDate), [selectedDate])

  const filteredReports = useMemo(() => {
    const scoped = reports.filter((report) => selectedTeamFilter === 'all' || report.teamId === selectedTeamFilter)

    if (reportView === 'day') {
      return scoped.filter((report) => report.date === selectedDate)
    }

    const start = startOfWeek(selectedDateValue, { weekStartsOn: 1 })
    const end = endOfWeek(selectedDateValue, { weekStartsOn: 1 })

    return scoped.filter((report) => {
      const value = parseDateKey(report.date)
      return value >= start && value <= end
    })
  }, [reportView, reports, selectedDate, selectedDateValue, selectedTeamFilter])

  const weeklyAssignments = useMemo(() => {
    if (!selectedTeamId) {
      return []
    }

    const start = startOfWeek(selectedDateValue, { weekStartsOn: 1 })
    const end = endOfWeek(selectedDateValue, { weekStartsOn: 1 })

    return assignments.filter((item) => {
      if (item.teamId !== selectedTeamId) {
        return false
      }

      const due = parseDateKey(item.deadline)
      return due >= start && due <= end
    })
  }, [assignments, selectedDateValue, selectedTeamId])

  function openCreateModal() {
    setModalMode('create')
    setActiveReport(null)
    setSelectedTeamId('')
    setLineMap({})
    setNote('')
    setIsModalOpen(true)
  }

  function openViewModal(report: ReportEntry) {
    setModalMode('view')
    setActiveReport(report)
    setIsModalOpen(true)
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setErrorMessage('')
    setSuccessMessage('')

    const selectedTeam = teams.find((team) => team.id === selectedTeamId)
    if (!selectedTeam) {
      setErrorMessage('Please choose a team.')
      return
    }

    const lines = weeklyAssignments
      .map((assignment) => ({
        assignmentId: assignment.id,
        assignmentTitle: assignment.taskName,
        workDone: (lineMap[assignment.id] ?? '').trim(),
      }))
      .filter((item) => item.workDone.length > 0)

    if (lines.length === 0 && !note.trim()) {
      setErrorMessage('Write at least one task update or note.')
      return
    }

    try {
      const created = await createReport({
        date: selectedDate,
        teamId: selectedTeam.id,
        teamName: selectedTeam.name,
        lines,
        note: note.trim(),
      })

      setReports((current) => [created, ...current])
      setSuccessMessage('Daily report posted.')
      setIsModalOpen(false)
    } catch {
      setErrorMessage('Failed to post report via backend API.')
    }
  }

  return (
    <section className="report-page" aria-label="Team daily report feed">
      <header className="report-page-head">
        <div>
          <h1>Report</h1>
          <p className="report-sub">Slack-style daily reporting feed by team and date.</p>
        </div>
        <button className="daily-report-add-button" type="button" onClick={openCreateModal}>
          New Message
        </button>
      </header>

      <div className="report-toolbar">
        <label htmlFor="reportView">View</label>
        <select id="reportView" value={reportView} onChange={(event) => setReportView(event.target.value as 'day' | 'week')}>
          <option value="day">Day</option>
          <option value="week">Week</option>
        </select>

        <label htmlFor="reportDate">Date</label>
        <input id="reportDate" type="date" value={selectedDate} onChange={(event) => setSelectedDate(event.target.value)} />

        <label htmlFor="reportTeamFilter">Team</label>
        <select id="reportTeamFilter" value={selectedTeamFilter} onChange={(event) => setSelectedTeamFilter(event.target.value)}>
          <option value="all">All teams</option>
          {teams.map((team) => (
            <option key={team.id} value={team.id}>
              {team.name}
            </option>
          ))}
        </select>
      </div>

      <FeedbackMessages className="user-mgmt-feedback" errorMessage={errorMessage} successMessage={successMessage} />

      <section className="report-feed">
        {isLoading ? (
          <p>Loading report feed...</p>
        ) : filteredReports.length === 0 ? (
          <p className="user-mgmt-sub">No reports found for this filter.</p>
        ) : (
          filteredReports.map((report) => (
            <article className="report-feed-card" key={report.id}>
              <div className="report-card-meta">
                <strong>{report.teamName}</strong>
                <span>{report.date}</span>
              </div>
              <p className="report-card-compact">{report.lines.length} assignment updates posted</p>
              <button type="button" className="daily-report-row-view" onClick={() => openViewModal(report)}>
                More
              </button>
            </article>
          ))
        )}
      </section>

      <ReportModal
        isOpen={isModalOpen}
        mode={modalMode}
        dateLabel={selectedDate}
        teamOptions={teams}
        selectedTeamId={selectedTeamId}
        onSelectedTeamIdChange={setSelectedTeamId}
        weeklyAssignments={weeklyAssignments}
        lineMap={lineMap}
        onLineChange={(assignmentId, value) => setLineMap((current) => ({ ...current, [assignmentId]: value }))}
        note={note}
        onNoteChange={setNote}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
        activeReport={activeReport}
      />
    </section>
  )
}

export default ReportPage
