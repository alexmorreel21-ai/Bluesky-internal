import { useEffect, useState } from 'react'
import { ConfirmDialog } from '../common/ConfirmDialog'
import { EmptyState } from '../common/EmptyState'
import { LoadingSpinner } from '../common/LoadingSpinner'
import { Modal } from '../common/Modal'
import { NewActionButton } from '../common/NewActionButton'
import {
  addMemberToTeam,
  addTeam,
  deleteTeam,
  getTeams,
  getUsers,
  removeMemberFromTeam,
  updateTeam,
} from '../../services/mockApi'
import type { TeamWithDetails } from '../../types/team.types'
import type { User } from '../../types/user.types'

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

export function TeamManagementTab() {
  const [teams, setTeams] = useState<TeamWithDetails[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [name, setName] = useState('')
  const [memberId, setMemberId] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false)
  const [editingTeamId, setEditingTeamId] = useState<string | null>(null)
  const [memberTargetTeam, setMemberTargetTeam] = useState<TeamWithDetails | null>(null)
  const [selectedLeaderId, setSelectedLeaderId] = useState('')
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const load = async () => {
    setLoading(true)
    setError(null)

    try {
      const [teamData, allUsers] = await Promise.all([getTeams(), getUsers()])
      setTeams(teamData)
      setUsers(allUsers)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load teams.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [])

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    try {
      if (editingTeamId) {
        await updateTeam(editingTeamId, { name })
      } else {
        await addTeam({ name, leaderId: '', memberIds: [] })
      }

      setName('')
      setEditingTeamId(null)
      setIsTeamModalOpen(false)
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save team.')
    }
  }

  const openCreateModal = () => {
    setEditingTeamId(null)
    setName('')
    setIsTeamModalOpen(true)
  }

  const openEditModal = (team: TeamWithDetails) => {
    setEditingTeamId(team.id)
    setName(team.name)
    setIsTeamModalOpen(true)
  }

  const openMembersModal = (team: TeamWithDetails) => {
    setMemberTargetTeam(team)
    setMemberId('')
    setSelectedLeaderId(team.leaderId)
  }

  const onSaveLeader = async () => {
    if (!memberTargetTeam) {
      return
    }

    try {
      await updateTeam(memberTargetTeam.id, { leaderId: selectedLeaderId })
      const refreshedTeams = await getTeams()
      setTeams(refreshedTeams)
      const nextTarget = refreshedTeams.find((team) => team.id === memberTargetTeam.id) ?? null
      setMemberTargetTeam(nextTarget)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update team leader.')
    }
  }

  const onAddMember = async () => {
    if (!memberTargetTeam || !memberId) {
      return
    }

    try {
      await addMemberToTeam(memberTargetTeam.id, memberId)
      const refreshedTeams = await getTeams()
      setTeams(refreshedTeams)
      const nextTarget = refreshedTeams.find((team) => team.id === memberTargetTeam.id) ?? null
      setMemberTargetTeam(nextTarget)
      setMemberId('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add member.')
    }
  }

  const onRemoveMember = async (targetMemberId: string) => {
    if (!memberTargetTeam) {
      return
    }

    try {
      await removeMemberFromTeam(memberTargetTeam.id, targetMemberId)
      const refreshedTeams = await getTeams()
      setTeams(refreshedTeams)
      const nextTarget = refreshedTeams.find((team) => team.id === memberTargetTeam.id) ?? null
      setMemberTargetTeam(nextTarget)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove member.')
    }
  }

  const onConfirmDelete = async () => {
    if (!deleteId) {
      return
    }

    try {
      await deleteTeam(deleteId)
      setDeleteId(null)
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete team.')
    }
  }

  const candidateMembers = memberTargetTeam
    ? users.filter((user) => user.id !== selectedLeaderId && !memberTargetTeam.memberIds.includes(user.id))
    : []

  return (
    <div className="space-y-4">
      <section className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">Team Management</h2>
        <NewActionButton onClick={openCreateModal} label="New Team" />
      </section>

      {error ? <p className="text-sm text-rose-600">{error}</p> : null}

      <section className="min-h-[62vh]">
        {loading ? (
          <LoadingSpinner />
        ) : teams.length === 0 ? (
          <EmptyState title="No teams" message="Create your first team." />
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {teams.map((team) => {
              const memberRows = team.memberIds.map((id) => {
                const user = users.find((entry) => entry.id === id)
                return {
                  id,
                  username: user?.username ?? id,
                  role: user?.role ?? 'unknown',
                }
              })

              return (
                <article
                  key={team.id}
                  className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-sky-100 text-lg font-bold text-sky-700 dark:bg-sky-900/40 dark:text-sky-200">
                        {toAvatarLabel(team.name)}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">{team.name}</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Leader: {team.leaderName}</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap justify-end gap-3">
                      <button
                        className="rounded-full border border-sky-200 bg-sky-50 px-3 py-1.5 text-sm font-semibold text-sky-700 transition hover:-translate-y-0.5 hover:bg-sky-100"
                        onClick={() => openEditModal(team)}
                      >
                        Edit
                      </button>
                      <button
                        className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-sm font-semibold text-emerald-700 transition hover:-translate-y-0.5 hover:bg-emerald-100"
                        onClick={() => openMembersModal(team)}
                      >
                        Manage
                      </button>
                      <button
                        className="rounded-full border border-rose-200 bg-rose-50 px-3 py-1.5 text-sm font-semibold text-rose-700 transition hover:-translate-y-0.5 hover:bg-rose-100"
                        onClick={() => setDeleteId(team.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  <div className="mt-4 flex-1 overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700">
                    <table className="w-full border-collapse text-sm">
                      <thead className="bg-slate-50 dark:bg-slate-800/70">
                        <tr>
                          <th className="border-b border-slate-200 px-3 py-2 text-left font-semibold text-slate-600 dark:border-slate-700 dark:text-slate-300">Type</th>
                          <th className="border-b border-slate-200 px-3 py-2 text-left font-semibold text-slate-600 dark:border-slate-700 dark:text-slate-300">Name</th>
                          <th className="border-b border-slate-200 px-3 py-2 text-left font-semibold text-slate-600 dark:border-slate-700 dark:text-slate-300">Role</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="bg-white dark:bg-slate-900">
                          <td className="border-b border-slate-100 px-3 py-2 text-slate-500 dark:border-slate-800 dark:text-slate-400">Leader</td>
                          <td className="border-b border-slate-100 px-3 py-2 text-slate-700 dark:border-slate-800 dark:text-slate-200">{team.leaderName}</td>
                          <td className="border-b border-slate-100 px-3 py-2 capitalize text-slate-700 dark:border-slate-800 dark:text-slate-200">{team.leaderRole}</td>
                        </tr>
                        {memberRows.length ? (
                          memberRows.map((member) => (
                            <tr key={`${team.id}-${member.id}`} className="bg-white dark:bg-slate-900">
                              <td className="border-b border-slate-100 px-3 py-2 text-slate-500 dark:border-slate-800 dark:text-slate-400">Member</td>
                              <td className="border-b border-slate-100 px-3 py-2 text-slate-700 dark:border-slate-800 dark:text-slate-200">{member.username}</td>
                              <td className="border-b border-slate-100 px-3 py-2 capitalize text-slate-700 dark:border-slate-800 dark:text-slate-200">{member.role}</td>
                            </tr>
                          ))
                        ) : (
                          <tr className="bg-white dark:bg-slate-900">
                            <td className="px-3 py-3 text-slate-500 dark:text-slate-400" colSpan={3}>
                              No members assigned.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                </article>
              )
            })}
          </div>
        )}
      </section>

      <Modal
        open={isTeamModalOpen}
        onClose={() => setIsTeamModalOpen(false)}
        title={editingTeamId ? 'Edit Team' : 'Add Team'}
        footer={null}
      >
        <form onSubmit={onSubmit} className="grid gap-3">
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Team name"
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
            required
          />
          {!editingTeamId ? (
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Create the team first. Then open Manage to choose the leader and members from existing users.
            </p>
          ) : null}
          <div className="flex justify-end">
            <button className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white dark:bg-white dark:text-slate-900">
              {editingTeamId ? 'Save Changes' : 'Add Team'}
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        open={Boolean(memberTargetTeam)}
        onClose={() => setMemberTargetTeam(null)}
        title={memberTargetTeam ? `Manage Team: ${memberTargetTeam.name}` : 'Manage Team'}
        footer={null}
      >
        {memberTargetTeam ? (
          <div className="grid gap-4">
            <div className="grid gap-2 md:grid-cols-[1fr_auto] md:items-center">
              <select
                value={selectedLeaderId}
                onChange={(event) => setSelectedLeaderId(event.target.value)}
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
              >
                <option value="">Select team leader</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.username}
                  </option>
                ))}
              </select>
              <button
                onClick={() => {
                  void onSaveLeader()
                }}
                className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white dark:bg-white dark:text-slate-900"
              >
                Save Leader
              </button>
            </div>

            <div className="grid gap-2 md:grid-cols-[1fr_auto] md:items-center">
              <select
                value={memberId}
                onChange={(event) => setMemberId(event.target.value)}
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
              >
                <option value="">Select member to add</option>
                {candidateMembers.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.username}
                  </option>
                ))}
              </select>
              <button
                onClick={() => {
                  void onAddMember()
                }}
                className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white dark:bg-white dark:text-slate-900"
              >
                Add Member
              </button>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                Current Leader: {memberTargetTeam.leaderName}
              </p>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">Current Members</p>
              {memberTargetTeam.memberIds.length === 0 ? (
                <p className="text-sm text-slate-500 dark:text-slate-400">No members yet.</p>
              ) : (
                <div className="space-y-2">
                  {memberTargetTeam.memberIds.map((id) => {
                    const user = users.find((entry) => entry.id === id)
                    return (
                      <div key={id} className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2 dark:border-slate-700">
                        <span className="text-sm text-slate-700 dark:text-slate-200">{user?.username ?? id}</span>
                        <button
                          onClick={() => {
                            void onRemoveMember(id)
                          }}
                          className="rounded-full border border-rose-200 bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-700 transition hover:-translate-y-0.5 hover:bg-rose-100"
                        >
                          Remove
                        </button>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        ) : null}
      </Modal>

      <ConfirmDialog
        open={Boolean(deleteId)}
        title="Delete team"
        message="Are you sure you want to delete this team? Active tasks may block deletion."
        onCancel={() => setDeleteId(null)}
        onConfirm={() => {
          void onConfirmDelete()
        }}
      />
    </div>
  )
}
