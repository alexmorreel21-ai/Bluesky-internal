import { useEffect, useMemo, useRef, useState } from 'react'
import { endOfWeek, format, startOfWeek } from 'date-fns'
import {
  createDailyReport,
  deleteDailyReport,
  fetchDailyReports,
  fetchDailyReportTeams,
  type DailyReportEntry,
  updateDailyReport,
} from '../../api/dailyReports'
import FeedbackMessages from '../../components/FeedbackMessages'
import DailyReportModal, {
  type DailyReportModalMode,
} from '../../modal/DailyReportModal'
import DailyReportFilters, { type ReportView } from './DailyReportFilters'
import DailyReportTable from './DailyReportTable'
import {
  formatDateKey,
  getTodayDateKey,
  parseDateKey,
  resolveReportHtml,
  stripHtml,
} from './dailyReportUtils'
import 'react-datepicker/dist/react-datepicker.css'

function DailyReportPage() {
  const todayKey = getTodayDateKey()
  const todayDate = parseDateKey(todayKey)

  const [reports, setReports] = useState<DailyReportEntry[]>([])
  const [teamOptions, setTeamOptions] = useState<Awaited<ReturnType<typeof fetchDailyReportTeams>>>([])
  const [isLoading, setIsLoading] = useState(true)
  const [reportView, setReportView] = useState<ReportView>('day')
  const [selectedDate, setSelectedDate] = useState(todayDate)
  const [selectedWeekDate, setSelectedWeekDate] = useState(todayDate)
  const [selectedMonthDate, setSelectedMonthDate] = useState(parseDateKey(`${todayKey.slice(0, 7)}-01`))
  const [selectedTeamFilter, setSelectedTeamFilter] = useState('all')
  const [isCalendarOpen, setIsCalendarOpen] = useState(false)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<DailyReportModalMode>('create')
  const [activeReportId, setActiveReportId] = useState('')
  const [lockedTeamName, setLockedTeamName] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const [selectedTeamId, setSelectedTeamId] = useState('')
  const [reportHtml, setReportHtml] = useState('')
  const [textColor, setTextColor] = useState('#1a2d44')
  const [highlightColor, setHighlightColor] = useState('#fff59d')
  const [editorUpdatedAt, setEditorUpdatedAt] = useState('')
  const editorRef = useRef<HTMLDivElement | null>(null)

  const today = getTodayDateKey()

  useEffect(() => {
    let isMounted = true

    async function loadPageData() {
      try {
        const [fetchedReports, fetchedTeams] = await Promise.all([
          fetchDailyReports(),
          fetchDailyReportTeams(),
        ])

        if (!isMounted) {
          return
        }

        setReports(fetchedReports)
        setTeamOptions(fetchedTeams)
        if (fetchedTeams.length > 0) {
          setSelectedTeamId(fetchedTeams[0].id)
        }
      } catch {
        if (!isMounted) {
          return
        }

        setReports([])
        setTeamOptions([])
        setErrorMessage('Failed to load daily reports from the backend API.')
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    void loadPageData()

    return () => {
      isMounted = false
    }
  }, [])

  useEffect(() => {
    if (!isAddModalOpen) {
      return
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsAddModalOpen(false)
      }
    }

    document.addEventListener('keydown', handleEscape)

    return () => {
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isAddModalOpen])

  useEffect(() => {
    if (typeof document === 'undefined') {
      return
    }

    const className = 'daily-report-picker-open'
    if (isCalendarOpen) {
      document.body.classList.add(className)
      return () => {
        document.body.classList.remove(className)
      }
    }

    document.body.classList.remove(className)

    return () => {
      document.body.classList.remove(className)
    }
  }, [isCalendarOpen])

  const filteredReports = useMemo(() => {
    const selectedWeekRange = {
      start: startOfWeek(selectedWeekDate, { weekStartsOn: 1 }),
      end: endOfWeek(selectedWeekDate, { weekStartsOn: 1 }),
    }
    const selectedDateKey = formatDateKey(selectedDate)
    const selectedMonthKey = format(selectedMonthDate, 'yyyy-MM')

    const rangeFiltered = reports.filter((report) => {
      if (selectedTeamFilter !== 'all' && report.teamName !== selectedTeamFilter) {
        return false
      }

      if (reportView === 'day') {
        return report.date === selectedDateKey
      }

      if (reportView === 'month') {
        return report.date.startsWith(selectedMonthKey)
      }

      const reportDate = parseDateKey(report.date)
      return reportDate >= selectedWeekRange.start && reportDate <= selectedWeekRange.end
    })

    return [...rangeFiltered].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
  }, [reports, reportView, selectedDate, selectedMonthDate, selectedTeamFilter, selectedWeekDate])

  const filterTitle =
    reportView === 'day'
      ? 'Daily Reports'
      : reportView === 'week'
        ? 'Weekly Reports'
        : 'Monthly Reports'

  const selectedWeekRange = useMemo(
    () => ({
      start: startOfWeek(selectedWeekDate, { weekStartsOn: 1 }),
      end: endOfWeek(selectedWeekDate, { weekStartsOn: 1 }),
    }),
    [selectedWeekDate],
  )

  const filterDescription =
    reportView === 'day'
      ? `Showing entries for ${formatDateKey(selectedDate)}.`
      : reportView === 'week'
        ? `Showing entries from ${formatDateKey(selectedWeekRange.start)} to ${formatDateKey(selectedWeekRange.end)}.`
        : `Showing entries for ${format(selectedMonthDate, 'yyyy-MM')}.`

  const emptyMessage =
    reportView === 'day'
      ? 'No daily reports submitted yet for today.'
      : reportView === 'week'
        ? 'No reports found for the selected week.'
        : 'No reports found for the selected month.'

  const teamFilterOptions = useMemo(() => {
    const fromTeams = teamOptions.map((team) => team.name)
    const fromReports = reports.map((report) => report.teamName)
    return Array.from(new Set([...fromTeams, ...fromReports])).sort((a, b) => a.localeCompare(b))
  }, [reports, teamOptions])

  const activeReport = useMemo(
    () => reports.find((report) => report.id === activeReportId) ?? null,
    [activeReportId, reports],
  )

  const editorText = useMemo(() => stripHtml(reportHtml), [reportHtml])
  const editorWordCount = editorText ? editorText.split(/\s+/).length : 0
  const editorCharacterCount = editorText.length

  function resetForm() {
    const nextHtml = ''
    setReportHtml(nextHtml)
    setTextColor('#1a2d44')
    setHighlightColor('#fff59d')
    setEditorUpdatedAt('')
    if (teamOptions.length > 0) {
      setSelectedTeamId(teamOptions[0].id)
    } else {
      setSelectedTeamId('')
    }
    if (editorRef.current) {
      editorRef.current.innerHTML = nextHtml
    }
  }

  function closeModal() {
    setIsAddModalOpen(false)
    setModalMode('create')
    setActiveReportId('')
    setLockedTeamName('')
  }

  function handleOpenModal() {
    setErrorMessage('')
    setSuccessMessage('')
    setModalMode('create')
    setActiveReportId('')
    setLockedTeamName('')
    resetForm()
    setIsAddModalOpen(true)
  }

  function openReportModal(report: DailyReportEntry, mode: DailyReportModalMode) {
    setErrorMessage('')
    setSuccessMessage('')
    setModalMode(mode)
    setActiveReportId(report.id)
    setLockedTeamName(report.teamName)
    setReportHtml(resolveReportHtml(report))
    setEditorUpdatedAt('')
    setIsAddModalOpen(true)
  }

  function syncEditorState() {
    if (!editorRef.current) {
      return
    }

    setReportHtml(editorRef.current.innerHTML)
    setEditorUpdatedAt(new Date().toISOString())
  }

  function applyEditorCommand(command: string, value?: string) {
    if (!editorRef.current) {
      return
    }

    editorRef.current.focus()
    document.execCommand(command, false, value)
    syncEditorState()
  }

  function handleEditorInput(event: React.FormEvent<HTMLDivElement>) {
    setReportHtml(event.currentTarget.innerHTML)
    setEditorUpdatedAt(new Date().toISOString())
  }

  useEffect(() => {
    if (!isAddModalOpen || !editorRef.current) {
      return
    }

    if (editorRef.current.innerHTML !== reportHtml) {
      editorRef.current.innerHTML = reportHtml
    }
  }, [isAddModalOpen, reportHtml])

  async function handleDeleteReport(reportId: string) {
    setErrorMessage('')
    setSuccessMessage('')

    try {
      await deleteDailyReport(reportId)
      setReports((currentReports) => currentReports.filter((report) => report.id !== reportId))
      setSuccessMessage('Daily report deleted.')
    } catch {
      setErrorMessage('Failed to delete the daily report via the backend API.')
    }
  }

  async function handleSubmitReport(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setErrorMessage('')
    setSuccessMessage('')

    if (modalMode === 'view') {
      return
    }

    if (modalMode === 'edit') {
      if (!activeReport) {
        setErrorMessage('Report could not be resolved for editing.')
        return
      }

      const normalizedReportText = stripHtml(reportHtml)
      if (!normalizedReportText) {
        setErrorMessage('Please write report content before saving.')
        return
      }

      const duplicateOnDate = reports.some(
        (report) =>
          report.id !== activeReport.id &&
          report.date === activeReport.date &&
          report.teamName.toLowerCase() === activeReport.teamName.toLowerCase(),
      )

      if (duplicateOnDate) {
        setErrorMessage('A daily report for this team already exists on this date.')
        return
      }

      try {
        const updatedReport = await updateDailyReport(activeReport.id, { reportHtml })
        setReports((currentReports) =>
          currentReports.map((report) => (report.id === activeReport.id ? updatedReport : report)),
        )
        closeModal()
        setSuccessMessage('Daily report updated successfully.')
      } catch {
        setErrorMessage('Failed to update the daily report via the backend API.')
      }
      return
    }

    const saveDate = getTodayDateKey()
    const selectedTeam = teamOptions.find((team) => team.id === selectedTeamId)
    const normalizedTeamName = selectedTeam?.name.trim() ?? ''
    const normalizedReportText = stripHtml(reportHtml)

    if (!normalizedTeamName) {
      setErrorMessage('Please select a team before saving the report.')
      return
    }

    if (!normalizedReportText) {
      setErrorMessage('Please write report content before saving.')
      return
    }

    const duplicateForToday = reports.some(
      (report) =>
        report.date === saveDate && report.teamName.toLowerCase() === normalizedTeamName.toLowerCase(),
    )

    if (duplicateForToday) {
      setErrorMessage('A daily report for this team already exists today.')
      return
    }

    try {
      const newReport = await createDailyReport({
        date: saveDate,
        teamId: selectedTeamId,
        teamName: normalizedTeamName,
        reportHtml,
      })

      setReports((currentReports) => [newReport, ...currentReports])
      resetForm()
      closeModal()
      setSuccessMessage('Daily report saved for today.')
    } catch {
      setErrorMessage('Failed to save the daily report via the backend API.')
    }
  }

  return (
    <section className="daily-report" aria-label="Daily report">
      <header className="daily-report-head">
        <div>
          <h1>Daily Report</h1>
          <p className="daily-report-note">
            Daily report is day-based. Filter the list by day, week, or month.
          </p>
        </div>

      </header>

      <DailyReportFilters
        reportView={reportView}
        onReportViewChange={setReportView}
        selectedDate={selectedDate}
        onSelectedDateChange={setSelectedDate}
        selectedWeekDate={selectedWeekDate}
        onSelectedWeekDateChange={setSelectedWeekDate}
        selectedMonthDate={selectedMonthDate}
        onSelectedMonthDateChange={setSelectedMonthDate}
        isCalendarOpen={isCalendarOpen}
        onCalendarOpenChange={setIsCalendarOpen}
        selectedTeamFilter={selectedTeamFilter}
        onSelectedTeamFilterChange={setSelectedTeamFilter}
        teamFilterOptions={teamFilterOptions}
        teamOptions={teamOptions}
        onAddClick={handleOpenModal}
      />

      <FeedbackMessages
        className="daily-report-feedback"
        errorMessage={errorMessage}
        successMessage={successMessage}
      />

      <DailyReportTable
        isLoading={isLoading}
        title={filterTitle}
        description={filterDescription}
        reports={filteredReports}
        emptyMessage={emptyMessage}
        resolveReportHtml={resolveReportHtml}
        onView={(report) => openReportModal(report, 'view')}
        onEdit={(report) => openReportModal(report, 'edit')}
        onDelete={handleDeleteReport}
      />

      <DailyReportModal
        isOpen={isAddModalOpen}
        mode={modalMode}
        onClose={closeModal}
        onSubmit={handleSubmitReport}
        today={today}
        teamOptions={teamOptions}
        selectedTeamId={selectedTeamId}
        lockedTeamName={lockedTeamName}
        onSelectedTeamIdChange={setSelectedTeamId}
        applyEditorCommand={applyEditorCommand}
        textColor={textColor}
        onTextColorChange={setTextColor}
        highlightColor={highlightColor}
        onHighlightColorChange={setHighlightColor}
        editorRef={editorRef}
        onEditorInput={handleEditorInput}
        editorWordCount={editorWordCount}
        editorCharacterCount={editorCharacterCount}
        editorUpdatedAt={editorUpdatedAt}
      />
    </section>
  )
}

export default DailyReportPage