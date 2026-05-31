import type { FormEventHandler } from 'react'
import type { AssignmentRecord } from '../api/assignments'

type TeamOption = {
  id: string
  name: string
}

type AssignmentModalProps = {
  isOpen: boolean
  title: string
  teams: TeamOption[]
  onClose: () => void
  onSubmit: FormEventHandler<HTMLFormElement>
  teamId: string
  onTeamIdChange: (value: string) => void
  taskName: string
  onTaskNameChange: (value: string) => void
  content: string
  onContentChange: (value: string) => void
  deadline: string
  onDeadlineChange: (value: string) => void
  objective: number
  onObjectiveChange: (value: number) => void
  manualTeamName: string
  onManualTeamNameChange: (value: string) => void
  editingAssignment?: AssignmentRecord | null
}

function AssignmentModal({
  isOpen,
  title,
  teams,
  onClose,
  onSubmit,
  teamId,
  onTeamIdChange,
  taskName,
  onTaskNameChange,
  content,
  onContentChange,
  deadline,
  onDeadlineChange,
  objective,
  onObjectiveChange,
  manualTeamName,
  onManualTeamNameChange,
  editingAssignment,
}: AssignmentModalProps) {
  if (!isOpen) {
    return null
  }

  return (
    <div className="user-mgmt-modal-backdrop" role="presentation">
      <section className="user-mgmt-modal" aria-label="Assignment modal" role="dialog" aria-modal="true">
        <header className="user-mgmt-modal-head">
          <h2>{title}</h2>
          <button type="button" className="user-mgmt-modal-close" onClick={onClose}>
            Close
          </button>
        </header>

        <form className="user-mgmt-modal-form" onSubmit={onSubmit}>
          <label htmlFor="assignmentTeam">Team</label>
          {editingAssignment ? (
            <input id="assignmentTeam" value={editingAssignment.teamName} readOnly />
          ) : teams.length === 0 ? (
            <input
              id="assignmentTeam"
              value={manualTeamName}
              onChange={(event) => onManualTeamNameChange(event.target.value)}
              placeholder="Enter team name"
              required
            />
          ) : (
            <select id="assignmentTeam" value={teamId} onChange={(event) => onTeamIdChange(event.target.value)} required>
              <option value="">Select team</option>
              {teams.map((team) => (
                <option key={team.id} value={team.id}>
                  {team.name}
                </option>
              ))}
            </select>
          )}

          <label htmlFor="assignmentTaskName">Task name</label>
          <input
            id="assignmentTaskName"
            value={taskName}
            onChange={(event) => onTaskNameChange(event.target.value)}
            placeholder="Landing page redesign"
            required
          />

          <label htmlFor="assignmentContent">Content</label>
          <textarea
            id="assignmentContent"
            className="assignment-textarea"
            value={content}
            onChange={(event) => onContentChange(event.target.value)}
            placeholder="Describe the exact scope and acceptance details"
            required
          />

          <label htmlFor="assignmentDeadline">Deadline</label>
          <input
            id="assignmentDeadline"
            type="date"
            value={deadline}
            onChange={(event) => onDeadlineChange(event.target.value)}
            required
          />

          <label htmlFor="assignmentObjective">Objective (numeric)</label>
          <input
            id="assignmentObjective"
            type="number"
            value={objective}
            min={1}
            max={100}
            onChange={(event) => onObjectiveChange(Number(event.target.value))}
            required
          />

          <div className="user-mgmt-modal-actions">
            <button type="button" className="user-mgmt-modal-cancel" onClick={onClose}>
              Cancel
            </button>
            <button type="submit">Save</button>
          </div>
        </form>
      </section>
    </div>
  )
}

export default AssignmentModal
