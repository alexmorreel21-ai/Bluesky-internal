import type { FormEventHandler } from 'react'
import type { TeamRecord, UserRecord } from '../Page/User/Table'

type TeamEntryModalProps = {
  isOpen: boolean
  onClose: () => void
  isManager: boolean
  hasTeam: boolean
  teamName: string
  onTeamNameChange: (value: string) => void
  leaderId: string
  onLeaderIdChange: (value: string) => void
  selectedTeamId: string
  onSelectedTeamIdChange: (value: string) => void
  memberUserId: string
  onMemberUserIdChange: (value: string) => void
  leaderOptions: UserRecord[]
  memberOptions: UserRecord[]
  teams: TeamRecord[]
  onCreateTeam: FormEventHandler<HTMLFormElement>
  onCreateMember: FormEventHandler<HTMLFormElement>
}

function TeamEntryModal({
  isOpen,
  onClose,
  isManager,
  hasTeam,
  teamName,
  onTeamNameChange,
  leaderId,
  onLeaderIdChange,
  selectedTeamId,
  onSelectedTeamIdChange,
  memberUserId,
  onMemberUserIdChange,
  leaderOptions,
  memberOptions,
  teams,
  onCreateTeam,
  onCreateMember,
}: TeamEntryModalProps) {
  if (!isOpen) {
    return null
  }

  return (
    <div className="team-mgmt-modal-backdrop" role="presentation">
      <section
        className="team-mgmt-modal"
        aria-label="Add team entries"
        role="dialog"
        aria-modal="true"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="team-mgmt-modal-head">
          <h2>Add Team Entry</h2>
          <button type="button" className="team-mgmt-modal-close" onClick={onClose}>
            Close
          </button>
        </header>

        <div className="team-mgmt-modal-grid">
          <section className="team-mgmt-modal-card" aria-label="Create team">
            <h3>Create Team</h3>
            <p className="team-mgmt-help">Create the group name and choose a leader from TeamLeader users.</p>

            <form className="team-mgmt-form" onSubmit={onCreateTeam}>
              <label htmlFor="teamName">Team name</label>
              <input
                id="teamName"
                value={teamName}
                onChange={(event) => onTeamNameChange(event.target.value)}
                placeholder="Alpha Team"
                disabled={!isManager}
                autoFocus
                required
              />

              <label htmlFor="leaderId">Team leader</label>
              <select
                id="leaderId"
                value={leaderId}
                onChange={(event) => onLeaderIdChange(event.target.value)}
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
            {!hasTeam && <p className="team-mgmt-help">Create at least one team before adding members.</p>}

            <form className="team-mgmt-form" onSubmit={onCreateMember}>
              <label htmlFor="selectedTeam">Team</label>
              <select
                id="selectedTeam"
                value={selectedTeamId}
                onChange={(event) => onSelectedTeamIdChange(event.target.value)}
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
                onChange={(event) => onMemberUserIdChange(event.target.value)}
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
  )
}

export default TeamEntryModal
