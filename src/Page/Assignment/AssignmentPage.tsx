import { useEffect, useMemo, useState } from 'react'
import {
  createAssignment,
  fetchAssignments,
  fetchAssignmentTeams,
  type AssignmentRecord,
  updateAssignment,
} from '../../api/assignments'
import { fetchCurrentUser } from '../../api/teams'
import FeedbackMessages from '../../components/FeedbackMessages'
import { LoadingSpinner } from '../../components/common/LoadingSpinner'
import AssignmentModal from '../../modal/AssignmentModal'

function AssignmentPage() {
  const [assignments, setAssignments] = useState<AssignmentRecord[]>([])
  const [teams, setTeams] = useState<Array<{ id: string; name: string }>>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingAssignment, setEditingAssignment] = useState<AssignmentRecord | null>(null)
  const [teamFilter, setTeamFilter] = useState('all')
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [canCreate, setCanCreate] = useState(false)

  const [teamId, setTeamId] = useState('')
  const [taskName, setTaskName] = useState('')
  const [content, setContent] = useState('')
  const [deadline, setDeadline] = useState('')
  const [objective, setObjective] = useState(10)
  const [manualTeamName, setManualTeamName] = useState('')

  useEffect(() => {
    let isMounted = true

    async function loadData() {
      try {
        const [assignmentItems, teamItems, me] = await Promise.all([
          fetchAssignments(),
          fetchAssignmentTeams(),
          fetchCurrentUser(),
        ])

        if (!isMounted) {
          return
        }

        setAssignments(assignmentItems)
        setTeams(teamItems)
        setCanCreate(me.permission === 'Manager' || me.permission === 'TeamLeader')
      } catch {
        if (!isMounted) {
          return
        }

        setAssignments([])
        setTeams([])
        setCanCreate(true)
        setErrorMessage('Failed to load assignment data from backend API.')
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    void loadData()

    return () => {
      isMounted = false
    }
  }, [])

  const filteredAssignments = useMemo(() => {
    const scoped = teamFilter === 'all' ? assignments : assignments.filter((item) => item.teamId === teamFilter)
    return [...scoped].sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
  }, [assignments, teamFilter])

  function resetForm() {
    setTeamId('')
    setManualTeamName('')
    setTaskName('')
    setContent('')
    setDeadline('')
    setObjective(10)
    setEditingAssignment(null)
  }

  function openCreateModal() {
    resetForm()
    if (teams[0]) {
      setTeamId(teams[0].id)
    }
    if (!deadline) {
      setDeadline(new Date().toISOString().slice(0, 10))
    }
    setIsModalOpen(true)
    setErrorMessage('')
    setSuccessMessage('')
  }

  function openEditModal(item: AssignmentRecord) {
    setEditingAssignment(item)
    setTeamId(item.teamId)
    setTaskName(item.taskName)
    setContent(item.content)
    setDeadline(item.deadline)
    setObjective(item.objective)
    setIsModalOpen(true)
    setErrorMessage('')
    setSuccessMessage('')
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setErrorMessage('')
    setSuccessMessage('')

    if (!taskName.trim() || !content.trim() || !deadline || objective < 1) {
      setErrorMessage('Enter task name, content, deadline, and objective.')
      return
    }

    try {
      if (editingAssignment) {
        const updated = await updateAssignment(editingAssignment.id, {
          taskName: taskName.trim(),
          content: content.trim(),
          deadline,
          objective,
        })

        setAssignments((current) => current.map((item) => (item.id === editingAssignment.id ? updated : item)))
        setSuccessMessage('Assignment updated successfully.')
      } else {
        const selectedTeam = teams.find((team) => team.id === teamId)
        const normalizedManualTeamName = manualTeamName.trim()

        if (!selectedTeam && !normalizedManualTeamName) {
          setErrorMessage('Please select a team.')
          return
        }

        const fallbackTeamId = `manual-${normalizedManualTeamName.toLowerCase().replace(/\s+/g, '-')}`
        const resolvedTeamId = selectedTeam?.id ?? fallbackTeamId
        const resolvedTeamName = selectedTeam?.name ?? normalizedManualTeamName

        const created = await createAssignment({
          teamId: resolvedTeamId,
          teamName: resolvedTeamName,
          taskName: taskName.trim(),
          content: content.trim(),
          deadline,
          objective,
        })

        setAssignments((current) => [created, ...current])
        setSuccessMessage('Assignment created successfully.')
      }

      setIsModalOpen(false)
      resetForm()
    } catch {
      setErrorMessage('Failed to save assignment via backend API.')
    }
  }

  async function handleToggleStatus(item: AssignmentRecord) {
    setErrorMessage('')
    setSuccessMessage('')

    const nextStatus = item.status === 'COMPLETED' ? 'IN_PROGRESS' : 'COMPLETED'
    const nextProgress = nextStatus === 'COMPLETED' ? 100 : Math.min(item.progress, 90)

    try {
      const updated = await updateAssignment(item.id, {
        status: nextStatus,
        progress: nextProgress,
      })
      setAssignments((current) => current.map((entry) => (entry.id === item.id ? updated : entry)))
      setSuccessMessage('Assignment status updated.')
    } catch {
      setErrorMessage('Failed to update assignment status.')
    }
  }

  async function handleProgressChange(item: AssignmentRecord, value: number) {
    const clamped = Math.max(0, Math.min(100, value))

    try {
      const updated = await updateAssignment(item.id, {
        progress: clamped,
        status: clamped >= 100 ? 'COMPLETED' : 'IN_PROGRESS',
      })

      setAssignments((current) => current.map((entry) => (entry.id === item.id ? updated : entry)))
    } catch {
      setErrorMessage('Failed to update assignment progress.')
    }
  }

  return (
    <section className="user-mgmt" aria-label="Assignment management">
      <header className="user-mgmt-head">
        <div>
          <h1>Assignment</h1>
          <p className="user-mgmt-note">Assign tasks by team, set objective scores, and track progress.</p>
        </div>

        <div className="user-mgmt-head-actions">
          <button className="user-mgmt-add-button" type="button" onClick={openCreateModal} disabled={!canCreate}>
            Add Assignment
          </button>
        </div>
      </header>

      <div className="assignment-filter-row">
        <label htmlFor="assignmentTeamFilter">Team filter</label>
        <select id="assignmentTeamFilter" value={teamFilter} onChange={(event) => setTeamFilter(event.target.value)}>
          <option value="all">All teams</option>
          {teams.map((team) => (
            <option key={team.id} value={team.id}>
              {team.name}
            </option>
          ))}
        </select>
      </div>

      <FeedbackMessages className="user-mgmt-feedback" errorMessage={errorMessage} successMessage={successMessage} />

      <section className="user-mgmt-list" aria-label="Assignment table">
        <h2>Task Table</h2>
        <p className="user-mgmt-sub">Only manager or team leader can create new tasks.</p>

        {isLoading ? (
          <LoadingSpinner label="Loading assignments" hint="Preparing task list and team options." />
        ) : (
          <table>
            <thead>
              <tr>
                <th>Task</th>
                <th>Team</th>
                <th>Deadline</th>
                <th>Objective</th>
                <th>Progress</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredAssignments.length === 0 ? (
                <tr>
                  <td colSpan={7}>No assignments found.</td>
                </tr>
              ) : (
                filteredAssignments.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <strong>{item.taskName}</strong>
                      <div className="assignment-mini-text">{item.content}</div>
                    </td>
                    <td>{item.teamName}</td>
                    <td>{item.deadline}</td>
                    <td>{item.objective}</td>
                    <td>
                      <input
                        type="range"
                        min={0}
                        max={100}
                        value={item.progress}
                        onChange={(event) => void handleProgressChange(item, Number(event.target.value))}
                      />
                      <div className="assignment-mini-text">{item.progress}%</div>
                    </td>
                    <td>
                      <span className={item.status === 'COMPLETED' ? 'role-badge is-admin' : 'role-badge'}>
                        {item.status === 'COMPLETED' ? 'Completed' : 'In progress'}
                      </span>
                    </td>
                    <td>
                      <div className="daily-report-row-actions">
                        <button type="button" className="daily-report-row-edit" onClick={() => openEditModal(item)}>
                          Edit
                        </button>
                        <button type="button" className="delete-account-button" onClick={() => void handleToggleStatus(item)}>
                          {item.status === 'COMPLETED' ? 'Reopen' : 'Done'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </section>

      <AssignmentModal
        isOpen={isModalOpen}
        title={editingAssignment ? 'Edit Assignment' : 'Add Assignment'}
        teams={teams}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
        teamId={teamId}
        onTeamIdChange={setTeamId}
        taskName={taskName}
        onTaskNameChange={setTaskName}
        content={content}
        onContentChange={setContent}
        deadline={deadline}
        onDeadlineChange={setDeadline}
        objective={objective}
        onObjectiveChange={setObjective}
        manualTeamName={manualTeamName}
        onManualTeamNameChange={setManualTeamName}
        editingAssignment={editingAssignment}
      />
    </section>
  )
}

export default AssignmentPage
