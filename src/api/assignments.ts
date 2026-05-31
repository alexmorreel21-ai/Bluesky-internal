import { jsonRequest, requestJson } from './http'

export type AssignmentStatus = 'IN_PROGRESS' | 'COMPLETED'

export type AssignmentRecord = {
  id: string
  teamId: string
  teamName: string
  taskName: string
  content: string
  deadline: string
  objective: number
  progress: number
  status: AssignmentStatus
  createdAt: string
  updatedAt: string
}

export type AssignmentPayload = {
  teamId: string
  teamName: string
  taskName: string
  content: string
  deadline: string
  objective: number
}

const STORAGE_KEY = 'bluesky_assignments_mock_v1'
const TEAM_STORAGE_KEY = 'bluesky_assignment_teams_mock_v1'

const DEFAULT_TEAMS = [
  { id: 'team-alpha', name: 'Alpha Team' },
  { id: 'team-bravo', name: 'Bravo Team' },
]

function getStoredAssignments(): AssignmentRecord[] {
  if (typeof window === 'undefined') {
    return []
  }

  const raw = window.localStorage.getItem(STORAGE_KEY)
  if (!raw) {
    return []
  }

  try {
    const parsed = JSON.parse(raw) as AssignmentRecord[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function setStoredAssignments(items: AssignmentRecord[]): void {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
}

function getStoredTeams(): Array<{ id: string; name: string }> {
  if (typeof window === 'undefined') {
    return DEFAULT_TEAMS
  }

  const raw = window.localStorage.getItem(TEAM_STORAGE_KEY)
  if (!raw) {
    window.localStorage.setItem(TEAM_STORAGE_KEY, JSON.stringify(DEFAULT_TEAMS))
    return DEFAULT_TEAMS
  }

  try {
    const parsed = JSON.parse(raw) as Array<{ id: string; name: string }>
    if (!Array.isArray(parsed) || parsed.length === 0) {
      return DEFAULT_TEAMS
    }
    return parsed
  } catch {
    return DEFAULT_TEAMS
  }
}

export async function fetchAssignments(): Promise<AssignmentRecord[]> {
  try {
    return await requestJson<AssignmentRecord[]>('/api/assignments', { method: 'GET' })
  } catch {
    return getStoredAssignments()
  }
}

export async function createAssignment(payload: AssignmentPayload): Promise<AssignmentRecord> {
  try {
    return await requestJson<AssignmentRecord>('/api/assignments', jsonRequest(payload, { method: 'POST' }))
  } catch {
    const now = new Date().toISOString()
    const nextItem: AssignmentRecord = {
      id: crypto.randomUUID(),
      ...payload,
      progress: 0,
      status: 'IN_PROGRESS',
      createdAt: now,
      updatedAt: now,
    }

    const nextItems = [nextItem, ...getStoredAssignments()]
    setStoredAssignments(nextItems)
    return nextItem
  }
}

export async function updateAssignment(
  assignmentId: string,
  payload: Partial<Pick<AssignmentRecord, 'taskName' | 'content' | 'deadline' | 'objective' | 'progress' | 'status'>>,
): Promise<AssignmentRecord> {
  try {
    return await requestJson<AssignmentRecord>(
      `/api/assignments/${encodeURIComponent(assignmentId)}`,
      jsonRequest(payload, { method: 'PUT' }),
    )
  } catch {
    const current = getStoredAssignments()
    const updatedAt = new Date().toISOString()

    let updatedItem: AssignmentRecord | null = null

    const nextItems = current.map((item) => {
      if (item.id !== assignmentId) {
        return item
      }

      updatedItem = {
        ...item,
        ...payload,
        updatedAt,
      }

      return updatedItem
    })

    setStoredAssignments(nextItems)

    if (!updatedItem) {
      throw new Error('Assignment not found.')
    }

    return updatedItem
  }
}

export async function fetchAssignmentTeams(): Promise<Array<{ id: string; name: string }>> {
  try {
    const teams = await requestJson<Array<{ id: string; name: string }>>('/api/teams', { method: 'GET' })
    if (teams.length > 0) {
      return teams
    }
    return getStoredTeams()
  } catch {
    return getStoredTeams()
  }
}
