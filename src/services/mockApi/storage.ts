import type { DailyReport } from '../../types/report.types'
import type { Task } from '../../types/task.types'
import type { Team } from '../../types/team.types'
import type { User } from '../../types/user.types'
import { STORAGE_KEYS, generateId } from './base'

function now(): string {
  return new Date().toISOString()
}

function makeSeedUsers(): User[] {
  const createdAt = now()

  return [
    { id: 'user_admin', username: 'admin', email: 'admin@bluesky.com', password: '1234567890', role: 'admin', createdAt, updatedAt: createdAt },
    { id: 'user_manager', username: 'manager', email: 'manager@bluesky.com', password: 'manager123', role: 'manager', createdAt, updatedAt: createdAt },
    { id: 'user_alice', username: 'alice', email: 'alice@bluesky.com', password: 'dev123', role: 'dev', createdAt, updatedAt: createdAt },
    { id: 'user_bob', username: 'bob', email: 'bob@bluesky.com', password: 'dev123', role: 'dev', createdAt, updatedAt: createdAt },
  ]
}

function ensureDefaultAdmin(users: User[]): User[] {
  const createdAt = now()
  const adminIndex = users.findIndex((user) => user.id === 'user_admin' || user.email.toLowerCase() === 'admin@bluesky.com')
  const defaultAdmin: User = {
    id: 'user_admin',
    username: 'admin',
    email: 'admin@bluesky.com',
    password: '1234567890',
    role: 'admin',
    createdAt,
    updatedAt: createdAt,
  }

  if (adminIndex === -1) {
    return [defaultAdmin, ...users]
  }

  const currentAdmin = users[adminIndex]
  if (!currentAdmin) {
    return [defaultAdmin, ...users]
  }

  const nextAdmin: User = {
    ...currentAdmin,
    id: 'user_admin',
    username: 'admin',
    email: 'admin@bluesky.com',
    password: '1234567890',
    role: 'admin',
    createdAt: currentAdmin.createdAt || createdAt,
    updatedAt: now(),
  }

  return users.map((user, index) => (index === adminIndex ? nextAdmin : user))
}

function makeSeedTeams(): Team[] {
  const createdAt = now()

  return [
    { id: 'team_frontend', name: 'Frontend Team', leaderId: 'user_manager', memberIds: ['user_alice', 'user_bob'], createdAt, updatedAt: createdAt },
    { id: 'team_backend', name: 'Backend Team', leaderId: 'user_admin', memberIds: ['user_alice'], createdAt, updatedAt: createdAt },
  ]
}

function makeSeedTasks(): Task[] {
  const createdAt = now()
  return [
    { id: 'task_ui', name: 'User Management UI', content: 'Build user and team management flows.', deadline: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10), objective: 50, teamId: 'team_frontend', status: 'in-progress', createdBy: 'user_manager', createdAt, updatedAt: createdAt },
    { id: 'task_report', name: 'Report Dashboard', content: 'Create report feed and modal flow.', deadline: new Date(Date.now() + 10 * 86400000).toISOString().slice(0, 10), objective: 80, teamId: 'team_frontend', status: 'in-progress', createdBy: 'user_manager', createdAt, updatedAt: createdAt },
    { id: 'task_api', name: 'API Integration', content: 'Prepare backend integration contracts.', deadline: new Date(Date.now() - 2 * 86400000).toISOString().slice(0, 10), objective: 100, teamId: 'team_backend', status: 'completed', createdBy: 'user_admin', createdAt, updatedAt: createdAt },
  ]
}

function makeSeedReports(): DailyReport[] {
  const dateToday = new Date().toISOString().slice(0, 10)
  const dateYesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10)
  const createdAt = now()

  return [
    {
      id: generateId('report'),
      date: dateToday,
      teamId: 'team_frontend',
      teamName: 'Frontend Team',
      authorId: 'user_alice',
      authorName: 'alice',
      entries: [
        { taskId: 'task_ui', taskName: 'User Management UI', completedValue: 20, referenceValue: 50, completedPercentage: 40 },
        { taskId: 'task_report', taskName: 'Report Dashboard', completedValue: 30, referenceValue: 80, completedPercentage: 37.5 },
      ],
      globalNotes: 'Need review from manager.',
      createdAt,
      updatedAt: createdAt,
    },
    {
      id: generateId('report'),
      date: dateYesterday,
      teamId: 'team_backend',
      teamName: 'Backend Team',
      authorId: 'user_admin',
      authorName: 'admin',
      entries: [{ taskId: 'task_api', taskName: 'API Integration', completedValue: 100, referenceValue: 100, completedPercentage: 100 }],
      createdAt,
      updatedAt: createdAt,
    },
  ]
}

export function readStorage<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') {
    return fallback
  }

  const raw = window.localStorage.getItem(key)
  if (!raw) {
    return fallback
  }

  try {
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

export function writeStorage<T>(key: string, value: T): void {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem(key, JSON.stringify(value))
}

export function initializeStorage(): void {
  if (typeof window === 'undefined') {
    return
  }

  if (!window.localStorage.getItem(STORAGE_KEYS.USERS)) {
    writeStorage(STORAGE_KEYS.USERS, makeSeedUsers())
  } else {
    writeStorage(STORAGE_KEYS.USERS, ensureDefaultAdmin(readStorage<User[]>(STORAGE_KEYS.USERS, [])))
  }

  if (!window.localStorage.getItem(STORAGE_KEYS.TEAMS)) {
    writeStorage(STORAGE_KEYS.TEAMS, makeSeedTeams())
  }

  if (!window.localStorage.getItem(STORAGE_KEYS.TASKS)) {
    writeStorage(STORAGE_KEYS.TASKS, makeSeedTasks())
  }

  if (!window.localStorage.getItem(STORAGE_KEYS.REPORTS)) {
    writeStorage(STORAGE_KEYS.REPORTS, makeSeedReports())
  }

}
