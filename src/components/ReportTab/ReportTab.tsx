import { useEffect, useState } from 'react'
import { EmptyState } from '../common/EmptyState'
import { LoadingSpinner } from '../common/LoadingSpinner'
import { Modal } from '../common/Modal'
import { NewActionButton } from '../common/NewActionButton'
import { Table } from '../common/Table'
import { getReports, getTeams, submitReport } from '../../services/mockApi'
import type { DailyReport } from '../../types/report.types'
import { useAuth } from '../../contexts/AuthContext'

export function ReportTab() {
  const { currentUser } = useAuth()
  const [reports, setReports] = useState<DailyReport[]>([])
  const [teams, setTeams] = useState<{ id: string; name: string }[]>([])
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [teamId, setTeamId] = useState('')
  const [taskName, setTaskName] = useState('')
  const [done, setDone] = useState('')
  const [globalNotes, setGlobalNotes] = useState('')

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const [reportData, teamData] = await Promise.all([getReports(), getTeams()])
      setReports(reportData)
      const mapped = teamData.map((item) => ({ id: item.id, name: item.name }))
      setTeams(mapped)
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

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!currentUser) {
      return
    }

    try {
      await submitReport({
        date,
        teamId,
        authorId: currentUser.id,
        entries: [{ taskId: 'manual', taskName, done }],
        globalNotes,
      })
      setOpen(false)
      setTaskName('')
      setDone('')
      setGlobalNotes('')
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit report.')
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <NewActionButton onClick={() => setOpen(true)} label="New Report" />
      </div>

      {error ? <p className="text-sm text-rose-600">{error}</p> : null}

      {loading ? (
        <LoadingSpinner />
      ) : reports.length === 0 ? (
        <EmptyState title="No reports" message="Submit your first daily report." />
      ) : (
        <Table
          data={reports}
          rowKey={(item) => item.id}
          columns={[
            { key: 'date', title: 'Date', render: (item) => item.date },
            { key: 'team', title: 'Team', render: (item) => item.teamName },
            { key: 'author', title: 'Author', render: (item) => item.authorName },
            {
              key: 'done',
              title: 'Summary',
              render: (item) => item.entries.map((entry) => `${entry.taskName}: ${entry.done}`).join(' | '),
            },
          ]}
        />
      )}

      <Modal open={open} onClose={() => setOpen(false)} title="Submit Daily Report" footer={null}>
        <form onSubmit={onSubmit} className="grid gap-3">
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950" required />
          <select value={teamId} onChange={(e) => setTeamId(e.target.value)} className="rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950">
            {teams.map((team) => <option key={team.id} value={team.id}>{team.name}</option>)}
          </select>
          <input value={taskName} onChange={(e) => setTaskName(e.target.value)} placeholder="Task name" className="rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950" required />
          <textarea value={done} onChange={(e) => setDone(e.target.value)} placeholder="What was done" className="rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950" rows={3} required />
          <textarea value={globalNotes} onChange={(e) => setGlobalNotes(e.target.value)} placeholder="Notes" className="rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950" rows={2} />
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setOpen(false)} className="rounded-lg border border-slate-300 px-3 py-2 text-sm">Cancel</button>
            <button className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white dark:bg-white dark:text-slate-900">Submit</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
