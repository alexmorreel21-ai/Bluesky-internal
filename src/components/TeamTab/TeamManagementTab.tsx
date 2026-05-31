import { useEffect, useState } from 'react'
import { ConfirmDialog } from '../common/ConfirmDialog'
import { EmptyState } from '../common/EmptyState'
import { LoadingSpinner } from '../common/LoadingSpinner'
import { Modal } from '../common/Modal'
import { NewActionButton } from '../common/NewActionButton'
import { Table } from '../common/Table'
import {
  addMemberToTeam,
  addTeam,
  deleteTeam,
  getManagersAndAdmins,
  getTeams,
  getUsers,
  removeMemberFromTeam,
  updateTeam,
} from '../../services/mockApi'
import type { TeamWithDetails } from '../../types/team.types'
import type { User } from '../../types/user.types'

export function TeamManagementTab() {
  const [teams, setTeams] = useState<TeamWithDetails[]>([])
  const [leaders, setLeaders] = useState<User[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [name, setName] = useState('')
  const [leaderId, setLeaderId] = useState('')
  const [memberId, setMemberId] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false)
  const [editingTeamId, setEditingTeamId] = useState<string | null>(null)
  const [memberTargetTeam, setMemberTargetTeam] = useState<TeamWithDetails | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const load = async () => {
    setLoading(true)
    setError(null)

    try {
      const [teamData, managerData, allUsers] = await Promise.all([getTeams(), getManagersAndAdmins(), getUsers()])
      setTeams(teamData)
      setLeaders(managerData)
      setUsers(allUsers)
      const firstLeader = managerData[0]
      if (!leaderId && firstLeader) {
        setLeaderId(firstLeader.id)
      }
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
        await updateTeam(editingTeamId, { name, leaderId })
      } else {
        await addTeam({ name, leaderId, memberIds: [] })
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
    setLeaderId(team.leaderId)
    setIsTeamModalOpen(true)
  }

  const openMembersModal = (team: TeamWithDetails) => {
    setMemberTargetTeam(team)
    setMemberId('')
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
    ? users.filter((user) => user.role === 'dev' && !memberTargetTeam.memberIds.includes(user.id))
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
          <Table
            data={teams}
            rowKey={(item) => item.id}
            columns={[
              { key: 'name', title: 'Team', render: (item) => item.name },
              { key: 'leader', title: 'Leader', render: (item) => item.leaderName },
              { key: 'members', title: 'Members', render: (item) => item.memberNames.join(', ') || '-' },
              {
                key: 'action',
                title: 'Actions',
                render: (item) => (
                  <div className="flex gap-3">
                    <button className="text-sm text-sky-600 hover:underline" onClick={() => openEditModal(item)}>
                      Edit
                    </button>
                    <button className="text-sm text-emerald-600 hover:underline" onClick={() => openMembersModal(item)}>
                      Members
                    </button>
                    <button className="text-sm text-rose-600 hover:underline" onClick={() => setDeleteId(item.id)}>
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
        open={isTeamModalOpen}
        onClose={() => setIsTeamModalOpen(false)}
        title={editingTeamId ? 'Edit Team' : 'Add Team'}
        footer={null}
      >
        <form onSubmit={onSubmit} className="grid gap-3 md:grid-cols-2">
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Team name"
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
            required
          />
          <select
            value={leaderId}
            onChange={(event) => setLeaderId(event.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
            required
          >
            {leaders.map((leader) => (
              <option key={leader.id} value={leader.id}>
                {leader.username}
              </option>
            ))}
          </select>
          <div className="md:col-span-2 flex justify-end">
            <button className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white dark:bg-white dark:text-slate-900">
              {editingTeamId ? 'Save Changes' : 'Add Team'}
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        open={Boolean(memberTargetTeam)}
        onClose={() => setMemberTargetTeam(null)}
        title={memberTargetTeam ? `Manage Members: ${memberTargetTeam.name}` : 'Manage Members'}
        footer={null}
      >
        {memberTargetTeam ? (
          <div className="grid gap-4">
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
                          className="text-sm text-rose-600 hover:underline"
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
