import { format, getWeekOfMonth, startOfWeek } from 'date-fns'
import { useEffect, useMemo, useRef, useState } from 'react'
import { EmptyState } from '../common/EmptyState'
import { LoadingSpinner } from '../common/LoadingSpinner'
import { Modal } from '../common/Modal'
import { NewActionButton } from '../common/NewActionButton'
import { getReports, getTasks, getTeams, submitReport } from '../../services/mockApi'
import type { DailyReport } from '../../types/report.types'
import type { TaskWithDetails } from '../../types/task.types'
import { useAuth } from '../../contexts/AuthContext'

export function ReportTab() {
  const { currentUser } = useAuth()
  const [reports, setReports] = useState<DailyReport[]>([])
  const [teams, setTeams] = useState<{ id: string; name: string }[]>([])
  const [tasks, setTasks] = useState<TaskWithDetails[]>([])
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [teamId, setTeamId] = useState('')
  const [entryInputs, setEntryInputs] = useState<Record<string, number>>({})
  const [reportDocument, setReportDocument] = useState('')
  const [selectedWeekStart, setSelectedWeekStart] = useState(
    format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd'),
  )
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null)
  const editorRef = useRef<HTMLDivElement | null>(null)

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const [reportData, teamData, taskData] = await Promise.all([getReports(), getTeams(), getTasks()])
      setReports(reportData)
      const mapped = teamData.map((item) => ({ id: item.id, name: item.name }))
      setTeams(mapped)
      setTasks(taskData)
      if (!teamId && mapped[0]?.id) {
        setTeamId(mapped[0].id)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load reports.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [])

  const weekOptions = useMemo(() => {
    const weekSet = new Set(
      reports.map((report) =>
        format(startOfWeek(new Date(report.date), { weekStartsOn: 1 }), 'yyyy-MM-dd'),
      ),
    )
    weekSet.add(selectedWeekStart)

    return Array.from(weekSet)
      .sort((a, b) => b.localeCompare(a))
      .map((weekStartDate) => ({
        value: weekStartDate,
        label: `${new Date(weekStartDate).getMonth() + 1}-${getWeekOfMonth(new Date(weekStartDate), { weekStartsOn: 1 })} week`,
      }))
  }, [reports, selectedWeekStart])

  const weeklyReports = useMemo(
    () =>
      reports.filter(
        (report) =>
          format(startOfWeek(new Date(report.date), { weekStartsOn: 1 }), 'yyyy-MM-dd') === selectedWeekStart,
      ),
    [reports, selectedWeekStart],
  )

  const selectedReport = useMemo(
    () => weeklyReports.find((report) => report.id === selectedReportId) ?? null,
    [selectedReportId, weeklyReports],
  )

  const teamTasks = tasks.filter((task) => task.teamId === teamId)

  const currentCompletedByTask = teamTasks.reduce<Record<string, number>>((acc, task) => {
    const current = reports.reduce((sum, report) => {
      return sum + report.entries.filter((entry) => entry.taskId === task.id).reduce((entrySum, entry) => entrySum + entry.completedValue, 0)
    }, 0)

    acc[task.id] = current
    return acc
  }, {})

  useEffect(() => {
    setEntryInputs((current) => {
      const next: Record<string, number> = {}
      teamTasks.forEach((task) => {
        next[task.id] = current[task.id] ?? 0
      })
      return next
    })
  }, [teamId, teamTasks])

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!currentUser) {
      return
    }

    const entries = teamTasks
      .map((task) => {
        const inputValue = Math.max(0, Number(entryInputs[task.id] ?? 0))
        const currentCompleted = currentCompletedByTask[task.id] ?? 0
        const referenceValue = task.objective || 0
        const completedPercentage = referenceValue > 0 ? Number((((currentCompleted + inputValue) / referenceValue) * 100).toFixed(2)) : 0

        return {
          taskId: task.id,
          taskName: task.name,
          completedValue: inputValue,
          referenceValue,
          completedPercentage,
        }
      })
      .filter((entry) => entry.completedValue > 0)

    if (!entries.length) {
      setError('Enter a completed value for at least one assignment.')
      return
    }

    try {
      await submitReport({
        date,
        teamId,
        authorId: currentUser.id,
        entries,
        globalNotes: reportDocument,
      })
      setOpen(false)
      setEntryInputs({})
      setReportDocument('')
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit report.')
    }
  }

  useEffect(() => {
    if (!open || !editorRef.current) {
      return
    }

    // Initialize editor content only when opening the modal; avoid resetting caret while typing.
    editorRef.current.innerHTML = reportDocument || '<p></p>'
  }, [open])

  const applyEditorCommand = (command: string) => {
    editorRef.current?.focus()
    const applied = document.execCommand(command)

    if (applied) {
      return
    }

    // Fallback for browsers that block deprecated rich-text commands.
    if (command === 'insertUnorderedList') {
      const inserted = document.execCommand('insertText', false, '- ')
      if (!inserted) {
        const selection = window.getSelection()
        if (selection?.rangeCount) {
          const range = selection.getRangeAt(0)
          range.deleteContents()
          const node = document.createTextNode('- ')
          range.insertNode(node)
          range.setStartAfter(node)
          range.setEndAfter(node)
          selection.removeAllRanges()
          selection.addRange(range)
        }
      }
      return
    }

    if (command === 'insertOrderedList') {
      const inserted = document.execCommand('insertText', false, '1. ')
      if (!inserted) {
        const selection = window.getSelection()
        if (selection?.rangeCount) {
          const range = selection.getRangeAt(0)
          range.deleteContents()
          const node = document.createTextNode('1. ')
          range.insertNode(node)
          range.setStartAfter(node)
          range.setEndAfter(node)
          selection.removeAllRanges()
          selection.addRange(range)
        }
      }
    }
  }

  const applyIndentation = (direction: 'indent' | 'outdent') => {
    editorRef.current?.focus()
    document.execCommand(direction)
  }

  const handleEditorKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'Tab') {
      return
    }

    event.preventDefault()
    applyIndentation(event.shiftKey ? 'outdent' : 'indent')
  }

  const handleOpenSubmitModal = () => {
    setReportDocument('')
    setOpen(true)
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-900">
          <label htmlFor="report-week-filter" className="text-sm font-semibold text-slate-600 dark:text-slate-300">
            Week
          </label>
          <select
            id="report-week-filter"
            value={selectedWeekStart}
            onChange={(event) => {
              setSelectedWeekStart(event.target.value)
              setSelectedReportId(null)
            }}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
          >
            {weekOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <NewActionButton onClick={handleOpenSubmitModal} label="New Report" />
      </div>

      {error ? <p className="text-sm text-rose-600">{error}</p> : null}

      {loading ? (
        <LoadingSpinner />
      ) : reports.length === 0 ? (
        <EmptyState title="No reports" message="Submit your first daily report." />
      ) : weeklyReports.length === 0 ? (
        <EmptyState title="No reports in this week" message="Select another week or submit a new daily report." />
      ) : (
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {weeklyReports.map((report) => (
            <article
              key={report.id}
              className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900"
            >
              <header className="mb-3 border-b border-slate-200 pb-3 dark:border-slate-700">
                <p className="text-xs uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">{report.date}</p>
                <h3 className="mt-1 text-base font-semibold text-slate-800 dark:text-slate-100">{report.teamName}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">Author: {report.authorName}</p>
              </header>

              <div className="space-y-2">
                {report.entries.map((entry) => (
                  <div
                    key={`${report.id}-${entry.taskId}`}
                    className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800/40"
                  >
                    <p className="font-semibold text-slate-700 dark:text-slate-200">{entry.taskName}</p>
                    <p className="text-slate-600 dark:text-slate-300">
                      {entry.completedValue}/{entry.referenceValue} ({entry.completedPercentage}%)
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-3 flex justify-end">
                <button
                  onClick={() => setSelectedReportId(report.id)}
                  className="rounded-full border border-sky-200 bg-sky-50 px-3 py-1.5 text-sm font-semibold text-sky-700 transition hover:-translate-y-0.5 hover:bg-sky-100"
                >
                  View details
                </button>
              </div>
            </article>
          ))}
        </section>
      )}

      <Modal
        open={Boolean(selectedReport)}
        onClose={() => setSelectedReportId(null)}
        title={selectedReport ? `Report Details - ${selectedReport.date}` : 'Report Details'}
        size="xlarge"
        footer={null}
      >
        {selectedReport ? (
          <div className="grid gap-4">
            <div className="grid gap-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm dark:border-slate-700 dark:bg-slate-800/40">
              <p className="text-slate-700 dark:text-slate-200"><strong>Team:</strong> {selectedReport.teamName}</p>
              <p className="text-slate-700 dark:text-slate-200"><strong>Author:</strong> {selectedReport.authorName}</p>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
              <table className="w-full min-w-[680px] border-collapse text-sm">
                <thead className="bg-slate-50 dark:bg-slate-800/70">
                  <tr>
                    <th className="border-b border-slate-200 px-3 py-2 text-left font-semibold text-slate-600 dark:border-slate-700 dark:text-slate-300">Assignment</th>
                    <th className="border-b border-slate-200 px-3 py-2 text-left font-semibold text-slate-600 dark:border-slate-700 dark:text-slate-300">Completed</th>
                    <th className="border-b border-slate-200 px-3 py-2 text-left font-semibold text-slate-600 dark:border-slate-700 dark:text-slate-300">Reference</th>
                    <th className="border-b border-slate-200 px-3 py-2 text-left font-semibold text-slate-600 dark:border-slate-700 dark:text-slate-300">Percentage</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedReport.entries.map((entry) => (
                    <tr key={`${selectedReport.id}-${entry.taskId}`} className="bg-white dark:bg-slate-900">
                      <td className="border-b border-slate-100 px-3 py-2 text-slate-700 dark:border-slate-800 dark:text-slate-200">{entry.taskName}</td>
                      <td className="border-b border-slate-100 px-3 py-2 text-slate-700 dark:border-slate-800 dark:text-slate-200">{entry.completedValue}</td>
                      <td className="border-b border-slate-100 px-3 py-2 text-slate-700 dark:border-slate-800 dark:text-slate-200">{entry.referenceValue}</td>
                      <td className="border-b border-slate-100 px-3 py-2 text-slate-700 dark:border-slate-800 dark:text-slate-200">{entry.completedPercentage}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {selectedReport.globalNotes ? (
              <section className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/40">
                <h4 className="mb-2 text-sm font-semibold text-slate-700 dark:text-slate-200">Report Document</h4>
                <div
                  className="prose prose-sm max-w-none text-slate-700 dark:text-slate-200"
                  dangerouslySetInnerHTML={{ __html: selectedReport.globalNotes }}
                />
              </section>
            ) : null}
          </div>
        ) : null}
      </Modal>

      <Modal open={open} onClose={() => setOpen(false)} title="Submit Daily Report" size="xlarge" footer={null}>
        <form onSubmit={onSubmit} className="grid gap-3">
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950" required />
          <select value={teamId} onChange={(e) => setTeamId(e.target.value)} className="rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950">
            {teams.map((team) => <option key={team.id} value={team.id}>{team.name}</option>)}
          </select>

          {teamTasks.length ? (
            <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
              <table className="w-full min-w-[760px] border-collapse text-sm">
                <thead className="bg-slate-50 dark:bg-slate-800/70">
                  <tr>
                    <th className="border-b border-slate-200 px-3 py-2 text-left font-semibold text-slate-600 dark:border-slate-700 dark:text-slate-300">Assignment</th>
                    <th className="border-b border-slate-200 px-3 py-2 text-left font-semibold text-slate-600 dark:border-slate-700 dark:text-slate-300">Input</th>
                    <th className="border-b border-slate-200 px-3 py-2 text-left font-semibold text-slate-600 dark:border-slate-700 dark:text-slate-300">Current Completed</th>
                    <th className="border-b border-slate-200 px-3 py-2 text-left font-semibold text-slate-600 dark:border-slate-700 dark:text-slate-300">Reference</th>
                    <th className="border-b border-slate-200 px-3 py-2 text-left font-semibold text-slate-600 dark:border-slate-700 dark:text-slate-300">Completed %</th>
                  </tr>
                </thead>
                <tbody>
                  {teamTasks.map((task) => {
                    const currentCompleted = currentCompletedByTask[task.id] ?? 0
                    const inputValue = Math.max(0, Number(entryInputs[task.id] ?? 0))
                    const reference = task.objective || 0
                    const completedPercent = reference > 0 ? Number((((currentCompleted + inputValue) / reference) * 100).toFixed(2)) : 0

                    return (
                      <tr key={task.id} className="bg-white dark:bg-slate-900">
                        <td className="border-b border-slate-100 px-3 py-2 text-slate-700 dark:border-slate-800 dark:text-slate-200">{task.name}</td>
                        <td className="border-b border-slate-100 px-3 py-2 dark:border-slate-800">
                          <input
                            type="number"
                            min={0}
                            value={inputValue}
                            onChange={(e) => setEntryInputs((prev) => ({ ...prev, [task.id]: Math.max(0, Number(e.target.value || 0)) }))}
                            className="w-24 rounded-lg border border-slate-300 px-2 py-1 text-sm dark:border-slate-700 dark:bg-slate-950"
                          />
                        </td>
                        <td className="border-b border-slate-100 px-3 py-2 text-slate-700 dark:border-slate-800 dark:text-slate-200">{currentCompleted}</td>
                        <td className="border-b border-slate-100 px-3 py-2 text-slate-700 dark:border-slate-800 dark:text-slate-200">{reference}</td>
                        <td className="border-b border-slate-100 px-3 py-2 text-slate-700 dark:border-slate-800 dark:text-slate-200">{completedPercent}%</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-slate-500 dark:text-slate-400">No assignments available for this team.</p>
          )}

          <section className="rounded-xl border border-slate-200 dark:border-slate-700">
            <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-700 dark:bg-slate-800/70">
              <button
                type="button"
                onClick={() => applyIndentation('outdent')}
                aria-label="Outdent"
                title="Outdent"
                className="rounded border border-slate-300 bg-white px-2 py-1 text-xs text-slate-700 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200"
              >
                {'<<'}
              </button>
              <button
                type="button"
                onClick={() => applyIndentation('indent')}
                aria-label="Indent"
                title="Indent"
                className="rounded border border-slate-300 bg-white px-2 py-1 text-xs text-slate-700 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200"
              >
                {'>>'}
              </button>

              <button
                type="button"
                onClick={() => applyEditorCommand('insertUnorderedList')}
                aria-label="Bullets"
                title="Bullets"
                className="rounded border border-slate-300 bg-white px-2 py-1 text-xs text-slate-700 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200"
              >
                *
              </button>
              <button
                type="button"
                onClick={() => applyEditorCommand('insertOrderedList')}
                aria-label="Numbering"
                title="Numbering"
                className="rounded border border-slate-300 bg-white px-2 py-1 text-xs text-slate-700 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200"
              >
                1.
              </button>
            </div>

            <div
              ref={editorRef}
              contentEditable
              onKeyDown={handleEditorKeyDown}
              onInput={(event) => setReportDocument((event.currentTarget as HTMLDivElement).innerHTML)}
              className="report-editor min-h-[220px] px-3 py-3 text-sm text-slate-700 outline-none dark:text-slate-200"
              suppressContentEditableWarning
            />
          </section>

          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setOpen(false)} className="rounded-lg border border-slate-300 px-3 py-2 text-sm">Cancel</button>
            <button className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white dark:bg-white dark:text-slate-900">Submit</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
