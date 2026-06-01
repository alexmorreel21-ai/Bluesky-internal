import { useEffect, useMemo, useState } from 'react'
import { LoadingSpinner } from '../common/LoadingSpinner'
import { getReports, getTasks, getTeams, getUsers } from '../../services/mockApi'
import type { DailyReport } from '../../types/report.types'
import type { TaskWithDetails } from '../../types/task.types'
import type { TeamWithDetails } from '../../types/team.types'

interface DashboardTreeData {
  totalUsers: number
  teams: TeamWithDetails[]
  tasks: TaskWithDetails[]
  reports: DailyReport[]
}

interface TeamStatusChartPoint {
  teamId: string
  teamName: string
  totalObjective: number
  completed: number
  completionRate: number
  reportCount: number
  activeAssignments: number
}

export function DashboardTab() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tree, setTree] = useState<DashboardTreeData | null>(null)

  useEffect(() => {
    let mounted = true

    async function load() {
      setLoading(true)
      setError(null)

      try {
        const [users, teams, tasks, reports] = await Promise.all([
          getUsers(),
          getTeams(),
          getTasks(),
          getReports(),
        ])

        if (!mounted) {
          return
        }

        setTree({
          totalUsers: users.length,
          teams,
          tasks,
          reports,
        })
      } catch (err) {
        if (!mounted) {
          return
        }

        setError(err instanceof Error ? err.message : 'Failed to load dashboard.')
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    void load()

    return () => {
      mounted = false
    }
  }, [])

  const teamStatusPoints = useMemo<TeamStatusChartPoint[]>(() => {
    if (!tree) {
      return []
    }

    return tree.teams
      .map((team) => {
        const teamTasks = tree.tasks.filter((task) => task.teamId === team.id)
        const teamReports = tree.reports.filter((report) => report.teamId === team.id)

        const totalObjective = teamTasks.reduce((sum, task) => sum + Math.max(0, task.objective || 0), 0)
        const completed = teamReports.reduce(
          (sum, report) => sum + report.entries.reduce((entrySum, entry) => entrySum + Math.max(0, entry.completedValue), 0),
          0,
        )

        const completionRate = totalObjective > 0 ? Number(((completed / totalObjective) * 100).toFixed(1)) : 0

        return {
          teamId: team.id,
          teamName: team.name,
          totalObjective,
          completed,
          completionRate,
          reportCount: teamReports.length,
          activeAssignments: teamTasks.filter((task) => task.status !== 'completed').length,
        }
      })
      .sort((a, b) => b.completionRate - a.completionRate)
  }, [tree])

  const maxObjective = useMemo(
    () => Math.max(1, ...teamStatusPoints.map((point) => point.totalObjective)),
    [teamStatusPoints],
  )

  return (
    <section className="grid gap-4">
      {loading ? <LoadingSpinner label="Loading dashboard..." /> : null}
      {!loading && error ? <p className="text-sm text-rose-600">{error}</p> : null}

      {!loading && !error ? (
        <>
      <article className="rounded-2xl border border-sky-100 bg-white/85 p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900/70">
        <p className="text-xs uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">Total Users</p>
        <p className="mt-2 text-4xl font-bold text-sky-600 dark:text-sky-300">{tree?.totalUsers ?? 0}</p>

        <div className="mt-6 rounded-xl border border-sky-100 bg-sky-50/60 p-4 dark:border-slate-700 dark:bg-slate-950/60">
          <p className="text-xs uppercase tracking-[0.1em] text-slate-500 dark:text-slate-400">Users Breakdown</p>

          <ul className="mt-4 space-y-3">
            <li className="rounded-xl border border-sky-100 bg-white p-3 dark:border-slate-700/70 dark:bg-slate-900/60">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">Teams</p>
                <span className="rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold text-sky-700 dark:bg-sky-500/20 dark:text-sky-200">
                  {tree?.teams.length ?? 0}
                </span>
              </div>

              <div className="mt-3 space-y-3 border-l border-sky-100 pl-4 dark:border-slate-700/70">
                {tree?.teams.length ? (
                  tree.teams.map((team) => (
                    <div key={team.id} className="rounded-xl border border-sky-100 bg-sky-50/60 p-3 dark:border-slate-700/80 dark:bg-slate-900/70">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{team.name}</p>
                        <div className="flex items-center gap-2 text-xs">
                          <span className="rounded-full bg-white px-2 py-1 text-slate-600 ring-1 ring-sky-100 dark:bg-slate-800 dark:text-slate-300 dark:ring-0">
                            {team.memberNames.length} members
                          </span>
                          <span className="text-slate-500 dark:text-slate-400">Leader: {team.leaderName}</span>
                        </div>
                      </div>

                      <div className="mt-2 border-l border-sky-100 pl-3 dark:border-slate-700/70">
                        <p className="mb-2 text-xs uppercase tracking-[0.08em] text-slate-500 dark:text-slate-400">Members</p>
                        {team.memberNames.length ? (
                          <ul className="grid gap-1">
                            {team.memberNames.map((member) => (
                              <li key={`${team.id}-${member}`} className="text-sm text-slate-700 dark:text-slate-200">
                                {member}
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-sm text-slate-500">No members assigned.</p>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-500">No teams found.</p>
                )}
              </div>
            </li>
          </ul>
        </div>
      </article>

      <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900/70">
        <header className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">Team Status</p>
            <h3 className="mt-1 text-xl font-semibold text-slate-800 dark:text-slate-100">Current Work Progress by Group</h3>
          </div>
          <span className="rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold text-sky-700 dark:bg-sky-500/20 dark:text-sky-200">
            Live from daily reports
          </span>
        </header>

        {!teamStatusPoints.length ? (
          <p className="text-sm text-slate-500 dark:text-slate-400">No team activity available yet.</p>
        ) : (
          <div className="space-y-4">
            {teamStatusPoints.map((point) => {
              const completionWidth = Math.min(100, point.completionRate)
              const objectiveWidth = Math.max(8, (point.totalObjective / maxObjective) * 100)

              return (
                <div
                  key={point.teamId}
                  className="rounded-2xl border border-slate-200 bg-gradient-to-r from-slate-50 via-white to-sky-50/70 p-4 dark:border-slate-700 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800/60"
                >
                  <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{point.teamName}</p>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="rounded-full bg-white px-2 py-1 text-slate-600 ring-1 ring-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-700">
                        {point.reportCount} reports
                      </span>
                      <span className="rounded-full bg-amber-100 px-2 py-1 font-semibold text-amber-700 dark:bg-amber-500/20 dark:text-amber-200">
                        {point.activeAssignments} active
                      </span>
                    </div>
                  </div>

                  <div className="mb-3 h-3 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-sky-500 via-cyan-400 to-emerald-400"
                      style={{ width: `${completionWidth}%` }}
                    />
                  </div>

                  <div className="grid gap-2 text-xs text-slate-600 dark:text-slate-300 sm:grid-cols-3">
                    <p>
                      Completed: <strong className="text-slate-800 dark:text-slate-100">{point.completed}</strong>
                    </p>
                    <p>
                      Target: <strong className="text-slate-800 dark:text-slate-100">{point.totalObjective}</strong>
                    </p>
                    <p>
                      Progress: <strong className="text-slate-800 dark:text-slate-100">{point.completionRate}%</strong>
                    </p>
                  </div>

                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-400"
                      style={{ width: `${objectiveWidth}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </article>
        </>
      ) : null}
    </section>
  )
}
