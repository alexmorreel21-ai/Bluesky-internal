import type { Task, TaskInput, TaskWithDetails } from '../../types/task.types'
import type { Team } from '../../types/team.types'
import type { User } from '../../types/user.types'
import { STORAGE_KEYS, apiHandler, generateId } from './base'
import { readStorage, writeStorage } from './storage'

function now(): string {
  return new Date().toISOString()
}

function getTasksRaw(): Task[] {
  return readStorage<Task[]>(STORAGE_KEYS.TASKS, [])
}

function setTasksRaw(tasks: Task[]): void {
  writeStorage(STORAGE_KEYS.TASKS, tasks)
}

function withDetails(tasks: Task[]): TaskWithDetails[] {
  const users = readStorage<User[]>(STORAGE_KEYS.USERS, [])
  const teams = readStorage<Team[]>(STORAGE_KEYS.TEAMS, [])

  return tasks.map((task) => ({
    ...task,
    teamName: teams.find((item) => item.id === task.teamId)?.name ?? 'Unknown Team',
    creatorName: users.find((item) => item.id === task.createdBy)?.username ?? 'Unknown User',
  }))
}

export const getTasks = async (): Promise<TaskWithDetails[]> => apiHandler(() => withDetails(getTasksRaw()))

export const getTaskById = async (id: string): Promise<Task | null> =>
  apiHandler(() => getTasksRaw().find((item) => item.id === id) ?? null)

export const getTasksByTeam = async (teamId: string): Promise<TaskWithDetails[]> =>
  apiHandler(() => withDetails(getTasksRaw().filter((item) => item.teamId === teamId)))

export const getTasksByCreator = async (creatorId: string): Promise<TaskWithDetails[]> =>
  apiHandler(() => withDetails(getTasksRaw().filter((item) => item.createdBy === creatorId)))

export const addTask = async (taskData: TaskInput, createdBy: string): Promise<Task> =>
  apiHandler(() => {
    const tasks = getTasksRaw()
    const createdAt = now()
    const nextTask: Task = {
      id: generateId('task'),
      ...taskData,
      status: taskData.status ?? 'in-progress',
      createdBy,
      createdAt,
      updatedAt: createdAt,
    }

    setTasksRaw([...tasks, nextTask])
    return nextTask
  })

export const updateTask = async (id: string, updates: Partial<TaskInput>): Promise<Task> =>
  apiHandler(() => {
    const tasks = getTasksRaw()
    const target = tasks.find((item) => item.id === id)
    if (!target) {
      throw new Error('Task not found.')
    }

    const updated: Task = { ...target, ...updates, updatedAt: now() }
    setTasksRaw(tasks.map((item) => (item.id === id ? updated : item)))
    return updated
  })

export const completeTask = async (id: string): Promise<Task> =>
  apiHandler(() => {
    const tasks = getTasksRaw()
    const target = tasks.find((item) => item.id === id)
    if (!target) {
      throw new Error('Task not found.')
    }

    const updated: Task = { ...target, status: 'completed', updatedAt: now() }
    setTasksRaw(tasks.map((item) => (item.id === id ? updated : item)))
    return updated
  })

export const deleteTask = async (id: string): Promise<void> =>
  apiHandler(() => {
    const tasks = getTasksRaw()
    setTasksRaw(tasks.filter((item) => item.id !== id))
  })

export const getOverdueTasks = async (): Promise<TaskWithDetails[]> =>
  apiHandler(() => {
    const today = new Date().toISOString().slice(0, 10)
    const overdue = getTasksRaw().filter((task) => task.deadline < today && task.status !== 'completed')
    return withDetails(overdue)
  })

export const getTaskStatistics = async (): Promise<{ total: number; inProgress: number; completed: number; overdue: number }> =>
  apiHandler(() => {
    const today = new Date().toISOString().slice(0, 10)
    const tasks = getTasksRaw()

    return {
      total: tasks.length,
      inProgress: tasks.filter((item) => item.status === 'in-progress').length,
      completed: tasks.filter((item) => item.status === 'completed').length,
      overdue: tasks.filter((item) => item.deadline < today && item.status !== 'completed').length,
    }
  })
