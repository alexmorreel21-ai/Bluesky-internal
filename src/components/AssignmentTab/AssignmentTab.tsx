import { useEffect, useMemo, useState } from 'react'
import { Badge } from '../common/Badge'
import { EmptyState } from '../common/EmptyState'
import { LoadingSpinner } from '../common/LoadingSpinner'
import { Modal } from '../common/Modal'
import { NewActionButton } from '../common/NewActionButton'
import { Table } from '../common/Table'
import { addTask, completeTask, deleteTask, getTaskStatistics, getTasks, getTeams } from '../../services/mockApi'
import type { TaskWithDetails } from '../../types/task.types'
import { useAuth } from '../../contexts/AuthContext'

export function AssignmentTab() {
  const { currentUser } = useAuth()
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

  const statusVariant = useMemo(() => ({ 'in-progress': 'warning', completed: 'success' } as const), [])

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
        ) : tasks.length === 0 ? (
          <EmptyState title="No assignments" message="Create your first assignment." />
        ) : (
          <Table
            data={tasks}
            rowKey={(item) => item.id}
            columns={[
              { key: 'name', title: 'Task', render: (item) => item.name },
              { key: 'team', title: 'Team', render: (item) => item.teamName },
              { key: 'deadline', title: 'Deadline', render: (item) => item.deadline },
              { key: 'objective', title: 'Objective', render: (item) => item.objective },
              { key: 'status', title: 'Status', render: (item) => <Badge variant={statusVariant[item.status]}>{item.status}</Badge> },
              {
                key: 'actions',
                title: 'Actions',
                render: (item) => (
                  <div className="flex gap-2">
                    {item.status !== 'completed' ? (
                      <button onClick={() => void completeTask(item.id).then(load)} className="text-sm text-emerald-600 hover:underline">
                        Complete
                      </button>
                    ) : null}
                    <button onClick={() => void deleteTask(item.id).then(load)} className="text-sm text-rose-600 hover:underline">
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
