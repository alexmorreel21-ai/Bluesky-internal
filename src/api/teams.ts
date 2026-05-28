import type { TeamMember, TeamMemberPayload, TeamPayload, TeamRecord, UserRecord } from '../Page/User/Table'
import { jsonRequest, requestJson } from './http'

export async function fetchCurrentUser(): Promise<UserRecord> {
  return requestJson<UserRecord>('/api/auth/me', { method: 'GET' })
}

export async function fetchTeamUsers(): Promise<UserRecord[]> {
  return requestJson<UserRecord[]>('/api/users', { method: 'GET' })
}

export async function fetchTeams(): Promise<TeamRecord[]> {
  return requestJson<TeamRecord[]>('/api/teams', { method: 'GET' })
}

export async function createTeam(payload: TeamPayload): Promise<TeamRecord> {
  return requestJson<TeamRecord>('/api/teams', jsonRequest(payload, { method: 'POST' }))
}

export async function addTeamMember(teamId: string, payload: TeamMemberPayload): Promise<TeamMember> {
  return requestJson<TeamMember>(
    `/api/teams/${encodeURIComponent(teamId)}/members`,
    jsonRequest(payload, { method: 'POST' }),
  )
}

export async function updateTeam(teamId: string, payload: TeamPayload): Promise<TeamRecord> {
  return requestJson<TeamRecord>(
    `/api/teams/${encodeURIComponent(teamId)}`,
    jsonRequest(payload, { method: 'PUT' }),
  )
}

export async function deleteTeam(teamId: string): Promise<void> {
  return requestJson<void>(`/api/teams/${encodeURIComponent(teamId)}`, { method: 'DELETE' })
}