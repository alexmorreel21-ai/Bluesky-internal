import type { Task } from '../../types/task.types'
import type { Team, TeamInput, TeamWithDetails } from '../../types/team.types'
import type { User } from '../../types/user.types'
import { apiHandler, STORAGE_KEYS, generateId } from './base'
import { readStorage, writeStorage } from './storage'

function now(): string {
  return new Date().toISOString()
}

function getTeamsRaw(): Team[] {
  return readStorage<Team[]>(STORAGE_KEYS.TEAMS, [])
}

function setTeamsRaw(teams: Team[]): void {
  writeStorage(STORAGE_KEYS.TEAMS, teams)
}

function withDetails(teams: Team[]): TeamWithDetails[] {
  const users = readStorage<User[]>(STORAGE_KEYS.USERS, [])

  return teams.map((team) => {
    const leader = users.find((item) => item.id === team.leaderId)
    const members = users.filter((item) => team.memberIds.includes(item.id))

    return {
      ...team,
      leaderName: leader?.username ?? 'Unassigned',
      leaderRole: leader?.role ?? 'unassigned',
      memberNames: members.map((item) => item.username),
    }
  })
}

export const getTeams = async (): Promise<TeamWithDetails[]> =>
  apiHandler(() => withDetails(getTeamsRaw()))

export const getTeamById = async (id: string): Promise<Team | null> =>
  apiHandler(() => getTeamsRaw().find((item) => item.id === id) ?? null)

export const getTeamsByLeader = async (leaderId: string): Promise<Team[]> =>
  apiHandler(() => getTeamsRaw().filter((item) => item.leaderId === leaderId))

export const getTeamsByMember = async (memberId: string): Promise<Team[]> =>
  apiHandler(() => getTeamsRaw().filter((item) => item.memberIds.includes(memberId)))

export const addTeam = async (teamData: TeamInput): Promise<Team> =>
  apiHandler(() => {
    const teams = getTeamsRaw()

    if (teams.some((item) => item.name.toLowerCase() === teamData.name.toLowerCase())) {
      throw new Error('Team name already exists.')
    }

    const createdAt = now()
    const nextTeam: Team = { id: generateId('team'), ...teamData, createdAt, updatedAt: createdAt }
    setTeamsRaw([...teams, nextTeam])
    return nextTeam
  })

export const updateTeam = async (id: string, updates: Partial<TeamInput>): Promise<Team> =>
  apiHandler(() => {
    const teams = getTeamsRaw()
    const target = teams.find((item) => item.id === id)
    if (!target) {
      throw new Error('Team not found.')
    }

    if (
      updates.name &&
      teams.some((item) => item.id !== id && item.name.toLowerCase() === updates.name?.toLowerCase())
    ) {
      throw new Error('Team name already exists.')
    }

    const nextLeaderId = updates.leaderId ?? target.leaderId
    const nextMemberIds =
      updates.memberIds ?? target.memberIds.filter((memberId) => memberId !== nextLeaderId)

    const updated: Team = {
      ...target,
      ...updates,
      leaderId: nextLeaderId,
      memberIds: nextMemberIds.filter((memberId) => memberId !== nextLeaderId),
      updatedAt: now(),
    }
    setTeamsRaw(teams.map((item) => (item.id === id ? updated : item)))
    return updated
  })

export const deleteTeam = async (id: string): Promise<void> =>
  apiHandler(() => {
    const teams = getTeamsRaw()
    const tasks = readStorage<Task[]>(STORAGE_KEYS.TASKS, [])

    if (tasks.some((task) => task.teamId === id && task.status === 'in-progress')) {
      throw new Error('Cannot delete team with active tasks.')
    }

    setTeamsRaw(teams.filter((team) => team.id !== id))
  })

export const addMemberToTeam = async (teamId: string, memberId: string): Promise<Team> =>
  apiHandler(() => {
    const teams = getTeamsRaw()
    const target = teams.find((item) => item.id === teamId)
    if (!target) {
      throw new Error('Team not found.')
    }

    if (target.leaderId === memberId) {
      throw new Error('Team leader cannot also be added as a member.')
    }

    if (target.memberIds.includes(memberId)) {
      return target
    }

    const updated: Team = { ...target, memberIds: [...target.memberIds, memberId], updatedAt: now() }
    setTeamsRaw(teams.map((item) => (item.id === teamId ? updated : item)))
    return updated
  })

export const removeMemberFromTeam = async (teamId: string, memberId: string): Promise<Team> =>
  apiHandler(() => {
    const teams = getTeamsRaw()
    const target = teams.find((item) => item.id === teamId)
    if (!target) {
      throw new Error('Team not found.')
    }

    const updated: Team = { ...target, memberIds: target.memberIds.filter((id) => id !== memberId), updatedAt: now() }
    setTeamsRaw(teams.map((item) => (item.id === teamId ? updated : item)))
    return updated
  })
