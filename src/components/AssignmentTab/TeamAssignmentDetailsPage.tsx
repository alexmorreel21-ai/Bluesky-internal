import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { APP_ROUTES } from '../../routes/appRoutes'
import { addTask, completeTask, deleteTask, getReports, getTasks, getTeams } from '../../services/mockApi'
import type { DailyReport } from '../../types/report.types'
import type { TaskWithDetails } from '../../types/task.types'
import { Badge } from '../common/Badge'
import { EmptyState } from '../common/EmptyState'
import { LoadingSpinner } from '../common/LoadingSpinner'
import { Modal } from '../common/Modal'
import { NewActionButton } from '../common/NewActionButton'
import { Table } from '../common/Table'

function toAvatarLabel(name: string): string {
  const words = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)

  if (!words.length) {
    return 'TM'
  }

  return words
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? '')
    .join('')
}

export function TeamAssignmentDetailsPage() {
  const { currentUser } = useAuth()
  const navigate = useNavigate()
  const { teamId = '' } = useParams<{ teamId: string }>()

  const [teamName, setTeamName] = useState<string | null>(null)
  const [tasks, setTasks] = useState<TaskWithDetails[]>([])
  const [reports, setReports] = useState<DailyReport[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [name, setName] = useState('')
  const [content, setContent] = useState('')
  const [deadline, setDeadline] = useState(new Date().toISOString().slice(0, 10))
  const [objective, setObjective] = useState(0)

  const canCreate = currentUser?.role === 'admin' || currentUser?.role === 'manager'

  const statusVariant = useMemo(() => ({ 'in-progress': 'warning', completed: 'success' } as const), [])

  const completedByTaskId = useMemo(() => {
    const map: Record<string, number> = {}

    reports.forEach((report) => {
      report.entries.forEach((entry) => {
        map[entry.taskId] = (map[entry.taskId] ?? 0) + entry.completedValue
      })
    })

    return map
  }, [reports])

  const load = async () => {
    setLoading(true)
    setError(null)

    try {
      const [allTeams, allTasks, allReports] = await Promise.all([getTeams(), getTasks(), getReports()])
      const selectedTeam = allTeams.find((team) => team.id === teamId)

      setTeamName(selectedTeam?.name ?? null)
      setTasks(allTasks.filter((task) => task.teamId === teamId))
      setReports(allReports.filter((report) => report.teamId === teamId))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load team assignments.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [teamId])

  const openCreateModal = () => {
    setName('')
    setContent('')
    setObjective(0)
    setDeadline(new Date().toISOString().slice(0, 10))
    setIsModalOpen(true)
  }

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!currentUser) {
      return
    }

    try {
      await addTask({ name, content, deadline, objective, teamId }, currentUser.id)
      setIsModalOpen(false)
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add assignment.')
    }
  }

  if (loading) {
    return <LoadingSpinner label="Loading team assignments..." />
  }

  if (!teamName) {
    return <EmptyState title="Team not found" message="The selected team could not be found." />
  }

  return (
    <div className="space-y-4">
      <section className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
        <div className="flex items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-sky-100 text-base font-bold text-sky-700 dark:bg-sky-900/40 dark:text-sky-200">
            {toAvatarLabel(teamName)}
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">Team Assignment</p>
            <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100">{teamName}</h2>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => navigate(APP_ROUTES.assignment)}
            className="rounded-full border border-slate-300 bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
          >
            Back
          </button>
          {canCreate ? <NewActionButton onClick={openCreateModal} label="New Assignment" /> : null}
        </div>
      </section>

      {error ? <p className="text-sm text-rose-600">{error}</p> : null}

      <section className="min-h-[56vh]">
        {tasks.length === 0 ? (
          <EmptyState title="No assignments" message="Create your first assignment for this team." />
        ) : (
          <Table
            data={tasks}
            rowKey={(item) => item.id}
            columns={[
              { key: 'name', title: 'Task', render: (item) => item.name },
              { key: 'content', title: 'Content', render: (item) => item.content },
              { key: 'deadline', title: 'Deadline', render: (item) => item.deadline },
              { key: 'objective', title: 'Objective', render: (item) => item.objective },
              {
                key: 'reportedProgress',
                title: 'Progress',
                render: (item) => {
                  const completed = completedByTaskId[item.id] ?? 0
                  return `${completed}/${item.objective}`
                },
              },
              {
                key: 'reportedPercent',
                title: 'Progress %',
                render: (item) => {
                  const completed = completedByTaskId[item.id] ?? 0
                  if (item.objective <= 0) {
                    return '-'
                  }

                  return `${((completed / item.objective) * 100).toFixed(2)}%`
                },
              },
              { key: 'status', title: 'Status', render: (item) => <Badge variant={statusVariant[item.status]}>{item.status}</Badge> },
              {
                key: 'actions',
                title: 'Actions',
                render: (item) => (
                  <div className="flex gap-2">
                    {item.status !== 'completed' ? (
                      <button
                        onClick={() => void completeTask(item.id).then(load)}
                        className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-sm font-semibold text-emerald-700 transition hover:-translate-y-0.5 hover:bg-emerald-100"
                      >
                        Complete
                      </button>
                    ) : null}
                    <button
                      onClick={() => void deleteTask(item.id).then(load)}
                      className="rounded-full border border-rose-200 bg-rose-50 px-3 py-1.5 text-sm font-semibold text-rose-700 transition hover:-translate-y-0.5 hover:bg-rose-100"
                    >
                      Delete
                    </button>
                  </div>
                ),
              },
            ]}
          />
        )}
      </section>

      <Modal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={`Create Assignment: ${teamName}`}
        footer={null}
      >
        <form onSubmit={onSubmit} className="grid gap-3 md:grid-cols-2">
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Task name"
            required
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
          />
          <input
            value={content}
            onChange={(event) => setContent(event.target.value)}
            placeholder="Task content"
            required
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
          />
          <input
            value={deadline}
            onChange={(event) => setDeadline(event.target.value)}
            type="date"
            required
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
          />
          <input
            value={objective}
            onChange={(event) => setObjective(Number(event.target.value))}
            type="number"
            min={0}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
          />
          <div className="md:col-span-2 flex justify-end">
            <button className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white dark:bg-white dark:text-slate-900">
              Add Assignment
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
