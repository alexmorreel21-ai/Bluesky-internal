import { useEffect, useState } from 'react'
import { LoadingSpinner } from '../common/LoadingSpinner'
import { getTeams, getUsers } from '../../services/mockApi'
import type { TeamWithDetails } from '../../types/team.types'

interface DashboardTreeData {
  totalUsers: number
  teams: TeamWithDetails[]
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
        const [users, teams] = await Promise.all([
          getUsers(),
          getTeams(),
        ])

        if (!mounted) {
          return
        }

        setTree({
          totalUsers: users.length,
          teams,
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

  if (loading) {
    return <LoadingSpinner label="Loading dashboard..." />
  }

  if (error) {
    return <p className="text-sm text-rose-600">{error}</p>
  }

  return (
    <section className="grid gap-4">
      <article className="rounded-2xl border border-slate-700 bg-slate-900/70 p-6">
        <p className="text-xs uppercase tracking-[0.12em] text-slate-400">Total Users</p>
        <p className="mt-2 text-4xl font-bold text-sky-300">{tree?.totalUsers ?? 0}</p>

        <div className="mt-6 rounded-xl border border-slate-700 bg-slate-950/60 p-4">
          <p className="text-xs uppercase tracking-[0.1em] text-slate-400">Users Breakdown</p>

          <ul className="mt-4 space-y-3">
            <li className="rounded-xl border border-slate-700/70 bg-slate-900/60 p-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-slate-100">Teams</p>
                <span className="rounded-full bg-sky-500/20 px-3 py-1 text-xs font-semibold text-sky-200">
                  {tree?.teams.length ?? 0}
                </span>
              </div>

              <div className="mt-3 space-y-3 border-l border-slate-700/70 pl-4">
                {tree?.teams.length ? (
                  tree.teams.map((team) => (
                    <div key={team.id} className="rounded-xl border border-slate-700/80 bg-slate-900/70 p-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="text-sm font-semibold text-slate-100">{team.name}</p>
                        <div className="flex items-center gap-2 text-xs">
                          <span className="rounded-full bg-slate-800 px-2 py-1 text-slate-300">
                            {team.memberNames.length} members
                          </span>
                          <span className="text-slate-400">Leader: {team.leaderName}</span>
                        </div>
                      </div>

                      <div className="mt-2 border-l border-slate-700/70 pl-3">
                        <p className="mb-2 text-xs uppercase tracking-[0.08em] text-slate-400">Members</p>
                        {team.memberNames.length ? (
                          <ul className="grid gap-1">
                            {team.memberNames.map((member) => (
                              <li key={`${team.id}-${member}`} className="text-sm text-slate-200">
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
    </section>
  )
}
