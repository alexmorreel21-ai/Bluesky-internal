import { useEffect, useMemo, useState } from 'react'
import type {
  TeamMember,
  TeamMemberPayload,
  TeamPayload,
  TeamRecord,
  UserRecord,
} from './Table'

async function fetchCurrentUser(): Promise<UserRecord> {
  const response = await fetch('/api/auth/me', {
    method: 'GET',
    headers: { Accept: 'application/json' },
  })

  if (!response.ok) {
    throw new Error('Failed to load current user.')
  }

  return (await response.json()) as UserRecord
}

async function fetchUsers(): Promise<UserRecord[]> {
  const response = await fetch('/api/users', {
    method: 'GET',
    headers: { Accept: 'application/json' },
  })

  if (!response.ok) {
    throw new Error('Failed to load users.')
  }

  return (await response.json()) as UserRecord[]
}

async function fetchTeams(): Promise<TeamRecord[]> {
  const response = await fetch('/api/teams', {
    method: 'GET',
    headers: { Accept: 'application/json' },
  })

  if (!response.ok) {
    throw new Error('Failed to load teams.')
  }

  return (await response.json()) as TeamRecord[]
}

async function createTeam(payload: TeamPayload): Promise<TeamRecord> {
  const response = await fetch('/api/teams', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    throw new Error('Failed to create team.')
  }

  return (await response.json()) as TeamRecord
}

async function addTeamMember(teamId: string, payload: TeamMemberPayload): Promise<TeamMember> {
  const response = await fetch(`/api/teams/${encodeURIComponent(teamId)}/members`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    throw new Error('Failed to add team member.')
  }

  return (await response.json()) as TeamMember
}

async function updateTeam(teamId: string, payload: TeamPayload): Promise<TeamRecord> {
  const response = await fetch(`/api/teams/${encodeURIComponent(teamId)}`, {
    method: 'PUT',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    throw new Error('Failed to update team.')
  }

  return (await response.json()) as TeamRecord
}

async function deleteTeam(teamId: string): Promise<void> {
  const response = await fetch(`/api/teams/${encodeURIComponent(teamId)}`, {
    method: 'DELETE',
    headers: { Accept: 'application/json' },
  })

  if (!response.ok) {
    throw new Error('Failed to delete team.')
  }
}

function TeamManagementPage() {
  const [currentUser, setCurrentUser] = useState<UserRecord | null>(null)
  const [users, setUsers] = useState<UserRecord[]>([])
  const [teams, setTeams] = useState<TeamRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const [teamName, setTeamName] = useState('')
  const [leaderId, setLeaderId] = useState('')

  const [selectedTeamId, setSelectedTeamId] = useState('')
  const [memberUserId, setMemberUserId] = useState('')

  const [editingTeamId, setEditingTeamId] = useState('')
  const [editingTeamName, setEditingTeamName] = useState('')
  const [editingLeaderId, setEditingLeaderId] = useState('')

  useEffect(() => {
    let isMounted = true

    async function loadPageData() {
      try {
        const [me, fetchedUsers, fetchedTeams] = await Promise.all([
          fetchCurrentUser(),
          fetchUsers(),
          fetchTeams(),
        ])

        if (!isMounted) {
          return
        }

        setCurrentUser(me)
        setUsers(fetchedUsers)
        setTeams(fetchedTeams)

        if (fetchedTeams.length > 0) {
          setSelectedTeamId(fetchedTeams[0].id)
        }
      } catch {
        if (!isMounted) {
          return
        }

        setCurrentUser(null)
        setUsers([])
        setTeams([])
        setErrorMessage('Backend unavailable. Failed to load team data from API.')
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

  const isManager = currentUser?.permission === 'Manager'
  const hasTeam = teams.length > 0

  const leaderOptions = useMemo(
    () => users.filter((user) => user.permission === 'TeamLeader'),
    [users],
  )

  const memberOptions = useMemo(
    () => users.filter((user) => user.permission === 'TeamMember'),
    [users],
  )

  const totalMembers = useMemo(
    () => teams.reduce((count, team) => count + team.members.length, 0),
    [teams],
  )

  const activeTeamCount = teams.filter((team) => team.members.length > 0).length

  async function handleCreateTeam(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setErrorMessage('')
    setSuccessMessage('')

    if (!isManager) {
      setErrorMessage('Only the manager can create teams.')
      return
    }

    if (!teamName.trim() || !leaderId) {
      setErrorMessage('Enter team name and select a team leader.')
      return
    }

    const payload: TeamPayload = {
      name: teamName.trim(),
      leaderId,
    }

    try {
      const createdTeam = await createTeam(payload)
      setTeams((currentTeams) => [createdTeam, ...currentTeams])
      setSelectedTeamId(createdTeam.id)
      setTeamName('')
      setLeaderId('')
      setSuccessMessage('Team created successfully.')
      setIsAddModalOpen(false)
    } catch {
      setErrorMessage('Failed to create team via API.')
    }
  }

  async function handleCreateMember(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setErrorMessage('')
    setSuccessMessage('')

    if (!isManager) {
      setErrorMessage('Only the manager can create team members.')
      return
    }

    if (!hasTeam) {
      setErrorMessage('Create a team first, then add team members.')
      return
    }

    if (!selectedTeamId || !memberUserId) {
      setErrorMessage('Select a team and a team member.')
      return
    }

    const selectedUser = users.find((user) => user.id === memberUserId)
    if (!selectedUser) {
      setErrorMessage('Selected team member could not be resolved.')
      return
    }

    const alreadyMember = teams
      .find((team) => team.id === selectedTeamId)
      ?.members.some((member) => member.userId === memberUserId)

    if (alreadyMember) {
      setErrorMessage('This user is already a member of the selected team.')
      return
    }

    try {
      const createdMember = await addTeamMember(selectedTeamId, { userId: memberUserId })

      setTeams((currentTeams) =>
        currentTeams.map((team) =>
          team.id === selectedTeamId ? { ...team, members: [...team.members, createdMember] } : team,
        ),
      )
      setMemberUserId('')
      setSuccessMessage('Team member created successfully.')
      setIsAddModalOpen(false)
    } catch {
      setErrorMessage('Failed to create team member via API.')
    }
  }

  function startEditing(team: TeamRecord) {
    setEditingTeamId(team.id)
    setEditingTeamName(team.name)
    setEditingLeaderId(team.leaderId)
    setErrorMessage('')
    setSuccessMessage('')
  }

  function cancelEditing() {
    setEditingTeamId('')
    setEditingTeamName('')
    setEditingLeaderId('')
  }

  async function saveTeamEdit(teamId: string) {
    setErrorMessage('')
    setSuccessMessage('')

    if (!isManager) {
      setErrorMessage('Only the manager can edit teams.')
      return
    }

    if (!editingTeamName.trim() || !editingLeaderId) {
      setErrorMessage('Enter team name and select a team leader.')
      return
    }

    const payload: TeamPayload = {
      name: editingTeamName.trim(),
      leaderId: editingLeaderId,
    }

    try {
      const updatedTeam = await updateTeam(teamId, payload)
      setTeams((currentTeams) =>
        currentTeams.map((team) => (team.id === teamId ? updatedTeam : team)),
      )
      cancelEditing()
      setSuccessMessage('Team updated successfully.')
    } catch {
      setErrorMessage('Failed to update team via API.')
    }
  }

  async function handleDeleteTeam(team: TeamRecord) {
    setErrorMessage('')
    setSuccessMessage('')

    if (!isManager) {
      setErrorMessage('Only the manager can delete teams.')
      return
    }

    try {
      await deleteTeam(team.id)
      setTeams((currentTeams) => currentTeams.filter((currentTeam) => currentTeam.id !== team.id))
      if (selectedTeamId === team.id) {
        setSelectedTeamId('')
      }
      setSuccessMessage('Team deleted successfully.')
    } catch {
      setErrorMessage('Failed to delete team via API.')
    }
  }

  return (
    <section className="team-mgmt" aria-label="Team management">
      <header className="team-mgmt-head">
        <div className="team-mgmt-headcopy">
          <p className="team-mgmt-eyebrow">Dashboard overview</p>
          <h1>Team Management</h1>
          <p>
            Only the manager can create a team with a leader. Once a team exists, members can be
            assigned from the available user pool.
          </p>

          <div className="team-mgmt-head-actions">
            <button className="team-mgmt-add-button" type="button" onClick={() => setIsAddModalOpen(true)}>
              Add Entry
            </button>
          </div>
        </div>

        <div className="team-mgmt-stats" aria-label="Team summary metrics">
          <article className="team-stat-card">
            <span className="team-stat-label">Total teams</span>
            <strong className="team-stat-value">{teams.length}</strong>
            <span className="team-stat-note">Configured groups</span>
          </article>

          <article className="team-stat-card is-accent-green">
            <span className="team-stat-label">Active teams</span>
            <strong className="team-stat-value">{activeTeamCount}</strong>
            <span className="team-stat-note">Teams with members</span>
          </article>

          <article className="team-stat-card is-accent-blue">
            <span className="team-stat-label">Team members</span>
            <strong className="team-stat-value">{totalMembers}</strong>
            <span className="team-stat-note">Assigned across teams</span>
          </article>

          <article className="team-stat-card is-accent-violet">
            <span className="team-stat-label">Available leaders</span>
            <strong className="team-stat-value">{leaderOptions.length}</strong>
            <span className="team-stat-note">Ready to assign</span>
          </article>
        </div>
      </header>

      <div className="team-mgmt-feedback" aria-live="polite">
        {errorMessage && <p className="form-message is-error">{errorMessage}</p>}
        {successMessage && <p className="form-message is-success">{successMessage}</p>}
      </div>

      <section className="team-mgmt-list" aria-label="Created teams">
        <div className="team-mgmt-list-head">
          <h2>Created Teams</h2>
          <p className="team-mgmt-sub">Live overview of leaders, members, and edit actions.</p>
        </div>
        {isLoading ? (
          <p>Loading team data...</p>
        ) : teams.length === 0 ? (
          <p>No teams created yet.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Team</th>
                <th>Leader</th>
                <th>Members</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {teams.map((team) => (
                <tr key={team.id}>
                  <td>
                    {editingTeamId === team.id ? (
                      <input
                        className="team-edit-input"
                        value={editingTeamName}
                        onChange={(event) => setEditingTeamName(event.target.value)}
                      />
                    ) : (
                      team.name
                    )}
                  </td>
                  <td>
                    {editingTeamId === team.id ? (
                      <select
                        className="team-edit-select"
                        value={editingLeaderId}
                        onChange={(event) => setEditingLeaderId(event.target.value)}
                      >
                        <option value="">Select leader</option>
                        {leaderOptions.map((leader) => (
                          <option key={leader.id} value={leader.id}>
                            {leader.username}
                          </option>
                        ))}
                      </select>
                    ) : (
                      team.leaderName
                    )}
                  </td>
                  <td>
                    {team.members.length === 0
                      ? 'No members'
                      : team.members.map((member) => member.username).join(', ')}
                  </td>
                  <td>
                    {editingTeamId === team.id ? (
                      <div className="team-action-buttons">
                        <button type="button" onClick={() => saveTeamEdit(team.id)} disabled={!isManager}>
                          Save
                        </button>
                        <button type="button" className="team-action-secondary" onClick={cancelEditing}>
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div className="team-action-buttons">
                        <button type="button" onClick={() => startEditing(team)} disabled={!isManager}>
                          Re-edit
                        </button>
                        <button
                          type="button"
                          className="team-action-danger"
                          onClick={() => handleDeleteTeam(team)}
                          disabled={!isManager}
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      {isAddModalOpen && (
        <div className="team-mgmt-modal-backdrop" role="presentation" onClick={() => setIsAddModalOpen(false)}>
          <section
            className="team-mgmt-modal"
            aria-label="Add team entries"
            role="dialog"
            aria-modal="true"
            onClick={(event) => event.stopPropagation()}
          >
            <header className="team-mgmt-modal-head">
              <h2>Add Team Entry</h2>
              <button type="button" className="team-mgmt-modal-close" onClick={() => setIsAddModalOpen(false)}>
                Close
              </button>
            </header>

            <div className="team-mgmt-modal-grid">
              <section className="team-mgmt-modal-card" aria-label="Create team">
                <h3>Create Team</h3>
                <p className="team-mgmt-help">Create the group name and choose a leader from TeamLeader users.</p>

                <form className="team-mgmt-form" onSubmit={handleCreateTeam}>
                  <label htmlFor="teamName">Team name</label>
                  <input
                    id="teamName"
                    value={teamName}
                    onChange={(event) => setTeamName(event.target.value)}
                    placeholder="Alpha Team"
                    disabled={!isManager}
                    autoFocus
                    required
                  />

                  <label htmlFor="leaderId">Team leader</label>
                  <select
                    id="leaderId"
                    value={leaderId}
                    onChange={(event) => setLeaderId(event.target.value)}
                    disabled={!isManager || leaderOptions.length === 0}
                    required
                  >
                    <option value="">Select team leader</option>
                    {leaderOptions.map((leader) => (
                      <option key={leader.id} value={leader.id}>
                        {leader.username} ({leader.email})
                      </option>
                    ))}
                  </select>

                  <button type="submit" disabled={!isManager}>
                    Create team
                  </button>
                </form>
              </section>

              <section className="team-mgmt-modal-card" aria-label="Create team member">
                <h3>Add Team Member</h3>
                {!hasTeam && (
                  <p className="team-mgmt-help">Create at least one team before adding members.</p>
                )}

                <form className="team-mgmt-form" onSubmit={handleCreateMember}>
                  <label htmlFor="selectedTeam">Team</label>
                  <select
                    id="selectedTeam"
                    value={selectedTeamId}
                    onChange={(event) => setSelectedTeamId(event.target.value)}
                    disabled={!isManager || !hasTeam}
                    required
                  >
                    <option value="">Select team</option>
                    {teams.map((team) => (
                      <option key={team.id} value={team.id}>
                        {team.name}
                      </option>
                    ))}
                  </select>

                  <label htmlFor="memberUserId">Team member</label>
                  <select
                    id="memberUserId"
                    value={memberUserId}
                    onChange={(event) => setMemberUserId(event.target.value)}
                    disabled={!isManager || !hasTeam || memberOptions.length === 0}
                    required
                  >
                    <option value="">Select member</option>
                    {memberOptions.map((member) => (
                      <option key={member.id} value={member.id}>
                        {member.username} ({member.email})
                      </option>
                    ))}
                  </select>

                  <button type="submit" disabled={!isManager || !hasTeam}>
                    Create team member
                  </button>
                </form>
              </section>
            </div>
          </section>
        </div>
      )}
    </section>
  )
}

export default TeamManagementPage
