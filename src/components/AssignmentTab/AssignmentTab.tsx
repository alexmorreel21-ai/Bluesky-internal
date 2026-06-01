import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { EmptyState } from '../common/EmptyState'
import { LoadingSpinner } from '../common/LoadingSpinner'
import { Modal } from '../common/Modal'
import { NewActionButton } from '../common/NewActionButton'
import { addTask, getTaskStatistics, getTasks, getTeams } from '../../services/mockApi'
import type { TaskWithDetails } from '../../types/task.types'
import { useAuth } from '../../contexts/AuthContext'
import { APP_ROUTES } from '../../routes/appRoutes'

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

export function AssignmentTab() {
  const { currentUser } = useAuth()
  const navigate = useNavigate()
  const [tasks, setTasks] = useState<TaskWithDetails[]>([])
  const [teams, setTeams] = useState<{ id: string; name: string }[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [content, setContent] = useState('')
  const [deadline, setDeadline] = useState(new Date().toISOString().slice(0, 10))
  const [objective, setObjective] = useState(0)
  const [teamId, setTeamId] = useState('')
  const [stats, setStats] = useState<{ total: number; inProgress: number; completed: number; overdue: number } | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const canCreate = currentUser?.role === 'admin' || currentUser?.role === 'manager'

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const [taskData, teamData, taskStats] = await Promise.all([getTasks(), getTeams(), getTaskStatistics()])
      setTasks(taskData)
      setTeams(teamData.map((item) => ({ id: item.id, name: item.name })))
      setStats(taskStats)
      if (!teamId && teamData[0]?.id) {
        setTeamId(teamData[0].id)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load assignments.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [])

  const teamCards = useMemo(
    () =>
      teams.map((team) => {
        const teamTasks = tasks.filter((task) => task.teamId === team.id)
        const inProgressCount = teamTasks.filter((task) => task.status === 'in-progress').length
        const completedCount = teamTasks.filter((task) => task.status === 'completed').length

        return {
          ...team,
          tasks: teamTasks,
          inProgressCount,
          completedCount,
        }
      }),
    [teams, tasks],
  )

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!currentUser) {
      return
    }

    try {
      await addTask({ name, content, deadline, objective, teamId }, currentUser.id)
      setName('')
      setContent('')
      setObjective(0)
      setIsModalOpen(false)
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add assignment.')
    }
  }

  const openCreateModal = () => {
    setName('')
    setContent('')
    setObjective(0)
    setDeadline(new Date().toISOString().slice(0, 10))
    setIsModalOpen(true)
  }

  return (
    <div className="space-y-4">
      <section className="grid gap-3 rounded-xl border border-slate-200 bg-white p-4 md:grid-cols-4 dark:border-slate-700 dark:bg-slate-900">
        <div>
          <p className="text-xs uppercase text-slate-400">Total</p>
          <p className="text-2xl font-bold">{stats?.total ?? '-'}</p>
        </div>
        <div>
          <p className="text-xs uppercase text-slate-400">In Progress</p>
          <p className="text-2xl font-bold">{stats?.inProgress ?? '-'}</p>
        </div>
        <div>
          <p className="text-xs uppercase text-slate-400">Completed</p>
          <p className="text-2xl font-bold">{stats?.completed ?? '-'}</p>
        </div>
        <div>
          <p className="text-xs uppercase text-slate-400">Overdue</p>
          <p className="text-2xl font-bold text-rose-600">{stats?.overdue ?? '-'}</p>
        </div>
      </section>

      {canCreate ? (
        <section className="flex justify-end">
          <NewActionButton onClick={openCreateModal} label="New Assignment" />
        </section>
      ) : null}

      {error ? <p className="text-sm text-rose-600">{error}</p> : null}

      <section className="min-h-[62vh]">
        {loading ? (
          <LoadingSpinner />
        ) : teams.length === 0 ? (
          <EmptyState title="No assignments" message="Create your first assignment." />
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {teamCards.map((team) => (
              <article
                key={team.id}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900"
              >
                <div className="flex flex-col items-center text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-sky-100 text-lg font-bold text-sky-700 dark:bg-sky-900/40 dark:text-sky-200">
                    {toAvatarLabel(team.name)}
                  </div>
                  <h3 className="mt-3 text-lg font-semibold text-slate-800 dark:text-slate-100">{team.name}</h3>
                </div>

                <dl className="mt-4 grid grid-cols-3 gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3 text-center dark:border-slate-700 dark:bg-slate-800/40">
                  <div>
                    <dt className="text-[11px] uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">Total</dt>
                    <dd className="mt-1 text-base font-semibold text-slate-800 dark:text-slate-100">{team.tasks.length}</dd>
                  </div>
                  <div>
                    <dt className="text-[11px] uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">In Progress</dt>
                    <dd className="mt-1 text-base font-semibold text-amber-600 dark:text-amber-300">{team.inProgressCount}</dd>
                  </div>
                  <div>
                    <dt className="text-[11px] uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">Completed</dt>
                    <dd className="mt-1 text-base font-semibold text-emerald-600 dark:text-emerald-300">{team.completedCount}</dd>
                  </div>
                </dl>

                <div className="mt-4 flex justify-end">
                  <button
                    onClick={() => navigate(`${APP_ROUTES.assignmentTeamDetails}/${team.id}`)}
                    className="rounded-full border border-sky-200 bg-sky-50 px-3 py-1.5 text-sm font-semibold text-sky-700 transition hover:-translate-y-0.5 hover:bg-sky-100"
                  >
                    More
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <Modal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create Assignment"
        footer={null}
      >
        <form onSubmit={onSubmit} className="grid gap-3 md:grid-cols-2">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Task name"
            required
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
          />
          <input
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Task content"
            required
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
          />
          <input
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            type="date"
            required
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
          />
          <input
            value={objective}
            onChange={(e) => setObjective(Number(e.target.value))}
            type="number"
            min={0}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
          />
          <select
            value={teamId}
            onChange={(e) => setTeamId(e.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
          >
            {teams.map((team) => (
              <option key={team.id} value={team.id}>
                {team.name}
              </option>
            ))}
          </select>
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
