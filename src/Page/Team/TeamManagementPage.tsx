import { useEffect, useMemo, useState } from 'react'
import {
  addTeamMember,
  createTeam,
  deleteTeam,
  fetchCurrentUser,
  fetchTeams,
  fetchTeamUsers,
  updateTeam,
} from '../../api/teams'
import FeedbackMessages from '../../components/FeedbackMessages'
import TeamEntryModal from '../../modal/TeamEntryModal'
import TeamTable from './TeamTable'
import type { TeamPayload, TeamRecord, UserRecord } from '../User/Table'

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
          fetchTeamUsers(),
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
        setErrorMessage('Failed to load team data from the backend API.')
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
      setErrorMessage('Failed to create team via the backend API.')
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
      setErrorMessage('Failed to create team member via the backend API.')
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
      setErrorMessage('Failed to update team via the backend API.')
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
      setTeams((currentTeams) => {
        const nextTeams = currentTeams.filter((currentTeam) => currentTeam.id !== team.id)
        setSelectedTeamId((currentSelectedTeamId) =>
          currentSelectedTeamId === team.id ? (nextTeams[0]?.id ?? '') : currentSelectedTeamId,
        )
        return nextTeams
      })
      setSuccessMessage('Team deleted successfully.')
    } catch {
      setErrorMessage('Failed to delete team via the backend API.')
    }
  }

  return (
    <section className="user-mgmt" aria-label="Team management">
      <header className="user-mgmt-head">
        <div>
          <h1>Team Management</h1>
          <p className="user-mgmt-note">
            Only the manager can create a team with a leader. Once a team exists, members can be
            assigned from backend users.
          </p>
        </div>

        <div className="user-mgmt-head-actions">
          <button className="user-mgmt-add-button" type="button" onClick={() => setIsAddModalOpen(true)}>
            Add Entry
          </button>
        </div>
      </header>

      <FeedbackMessages
        className="user-mgmt-feedback"
        errorMessage={errorMessage}
        successMessage={successMessage}
      />

      <TeamTable
        teams={teams}
        isLoading={isLoading}
        isManager={Boolean(isManager)}
        leaderOptions={leaderOptions}
        editingTeamId={editingTeamId}
        editingTeamName={editingTeamName}
        editingLeaderId={editingLeaderId}
        onEditingTeamNameChange={setEditingTeamName}
        onEditingLeaderIdChange={setEditingLeaderId}
        onStartEditing={startEditing}
        onCancelEditing={cancelEditing}
        onSaveEdit={saveTeamEdit}
        onDelete={handleDeleteTeam}
      />

      <TeamEntryModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        isManager={Boolean(isManager)}
        hasTeam={hasTeam}
        teamName={teamName}
        onTeamNameChange={setTeamName}
        leaderId={leaderId}
        onLeaderIdChange={setLeaderId}
        selectedTeamId={selectedTeamId}
        onSelectedTeamIdChange={setSelectedTeamId}
        memberUserId={memberUserId}
        onMemberUserIdChange={setMemberUserId}
        leaderOptions={leaderOptions}
        memberOptions={memberOptions}
        teams={teams}
        onCreateTeam={handleCreateTeam}
        onCreateMember={handleCreateMember}
      />
    </section>
  )
}

export default TeamManagementPage
