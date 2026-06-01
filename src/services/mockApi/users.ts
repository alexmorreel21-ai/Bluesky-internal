import type { Task } from '../../types/task.types'
import type { Team } from '../../types/team.types'
import type { User, UserInput } from '../../types/user.types'
import { apiHandler, generateId, STORAGE_KEYS } from './base'
import { readStorage, writeStorage } from './storage'

function now(): string {
  return new Date().toISOString()
}

function getUsersRaw(): User[] {
  return readStorage<User[]>(STORAGE_KEYS.USERS, [])
}

function setUsersRaw(users: User[]): void {
  writeStorage(STORAGE_KEYS.USERS, users)
}

export const getUsers = async (): Promise<User[]> =>
  apiHandler(() => [...getUsersRaw()].sort((a, b) => a.username.localeCompare(b.username)))

export const getUserById = async (id: string): Promise<User | null> =>
  apiHandler(() => getUsersRaw().find((item) => item.id === id) ?? null)

export const authenticateUser = async (email: string, password: string): Promise<User | null> =>
  apiHandler(() => {
    const normalizedEmail = email.trim().toLowerCase()
    return (
      getUsersRaw().find(
        (item) => item.email.toLowerCase() === normalizedEmail && item.password === password,
      ) ?? null
    )
  })

export const addUser = async (userData: UserInput): Promise<User> =>
  apiHandler(() => {
    const users = getUsersRaw()

    if (users.some((item) => item.username.toLowerCase() === userData.username.toLowerCase())) {
      throw new Error('Username already exists.')
    }

    if (users.some((item) => item.email.toLowerCase() === userData.email.toLowerCase())) {
      throw new Error('Email already exists.')
    }

    const createdAt = now()
    const nextUser: User = { id: generateId('user'), ...userData, createdAt, updatedAt: createdAt }
    setUsersRaw([...users, nextUser])
    return nextUser
  })

export const updateUser = async (id: string, updates: Partial<UserInput>): Promise<User> =>
  apiHandler(() => {
    const users = getUsersRaw()
    const target = users.find((item) => item.id === id)
    if (!target) {
      throw new Error('User not found.')
    }

    if (
      updates.username &&
      users.some((item) => item.id !== id && item.username.toLowerCase() === updates.username?.toLowerCase())
    ) {
      throw new Error('Username already exists.')
    }

    if (
      updates.email &&
      users.some((item) => item.id !== id && item.email.toLowerCase() === updates.email?.toLowerCase())
    ) {
      throw new Error('Email already exists.')
    }

    const updated: User = { ...target, ...updates, updatedAt: now() }
    setUsersRaw(users.map((item) => (item.id === id ? updated : item)))
    return updated
  })

export const deleteUser = async (id: string): Promise<void> =>
  apiHandler(() => {
    const users = getUsersRaw()
    const teams = readStorage<Team[]>(STORAGE_KEYS.TEAMS, [])
    const tasks = readStorage<Task[]>(STORAGE_KEYS.TASKS, [])

    if (teams.some((team) => team.leaderId === id)) {
      throw new Error('Cannot delete user who is a team leader.')
    }

    if (tasks.some((task) => task.createdBy === id)) {
      throw new Error('Cannot delete user who has assigned tasks.')
    }

    setUsersRaw(users.filter((item) => item.id !== id))
  })

export const getUsersByRole = async (role: User['role']): Promise<User[]> =>
  apiHandler(() => getUsersRaw().filter((item) => item.role === role))

export const getDevUsers = async (): Promise<User[]> => getUsersByRole('dev')

export const getManagersAndAdmins = async (): Promise<User[]> =>
  apiHandler(() => getUsersRaw().filter((item) => item.role === 'admin' || item.role === 'manager'))
