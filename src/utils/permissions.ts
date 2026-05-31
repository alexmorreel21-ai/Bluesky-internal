import type { DailyReport } from '../types/report.types'
import type { Task } from '../types/task.types'
import type { Team } from '../types/team.types'
import type { User } from '../types/user.types'

export function canCreateTask(user: User | null): boolean {
  return user?.role === 'admin' || user?.role === 'manager'
}

export function canEditTask(user: User | null, task: Task): boolean {
  return Boolean(user && (user.role === 'admin' || task.createdBy === user.id))
}

export function canDeleteTask(user: User | null, task: Task): boolean {
  return canEditTask(user, task)
}

export function canEditTeam(user: User | null, team: Team): boolean {
  return Boolean(user && (user.role === 'admin' || team.leaderId === user.id))
}

export function canWriteReport(user: User | null): boolean {
  return Boolean(user)
}

export function canViewReport(user: User | null, report: DailyReport): boolean {
  return Boolean(user && (user.role === 'admin' || user.role === 'manager' || user.id === report.authorId))
}
