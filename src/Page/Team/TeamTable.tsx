import type { TeamRecord, UserRecord } from '../User/Table'
import { LoadingSpinner } from '../../components/common/LoadingSpinner'

type TeamTableProps = {
  teams: TeamRecord[]
  isLoading: boolean
  isManager: boolean
  leaderOptions: UserRecord[]
  editingTeamId: string
  editingTeamName: string
  editingLeaderId: string
  onEditingTeamNameChange: (value: string) => void
  onEditingLeaderIdChange: (value: string) => void
  onStartEditing: (team: TeamRecord) => void
  onCancelEditing: () => void
  onSaveEdit: (teamId: string) => void
  onDelete: (team: TeamRecord) => void
}

function TeamTable({
  teams,
  isLoading,
  isManager,
  leaderOptions,
  editingTeamId,
  editingTeamName,
  editingLeaderId,
  onEditingTeamNameChange,
  onEditingLeaderIdChange,
  onStartEditing,
  onCancelEditing,
  onSaveEdit,
  onDelete,
}: TeamTableProps) {
  const totalMembers = teams.reduce((count, team) => count + team.members.length, 0)
  const activeTeamCount = teams.filter((team) => team.members.length > 0).length

  return (
    <section className="user-mgmt-list" aria-label="Created teams">
      <h2>Created Teams</h2>
      <p className="user-mgmt-sub">
        Active teams: {activeTeamCount}, assigned members: {totalMembers}, available leaders:{' '}
        {leaderOptions.length}
      </p>
      {isLoading ? (
        <LoadingSpinner label="Loading team data" hint="Preparing teams, leaders, and member assignments." />
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
                      onChange={(event) => onEditingTeamNameChange(event.target.value)}
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
                      onChange={(event) => onEditingLeaderIdChange(event.target.value)}
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
                      <button type="button" onClick={() => onSaveEdit(team.id)} disabled={!isManager}>
                        Save
                      </button>
                      <button type="button" className="team-action-secondary" onClick={onCancelEditing}>
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div className="team-action-buttons">
                      <button type="button" onClick={() => onStartEditing(team)} disabled={!isManager}>
                        Re-edit
                      </button>
                      <button
                        type="button"
                        className="team-action-danger"
                        onClick={() => onDelete(team)}
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
  )
}

export default TeamTable