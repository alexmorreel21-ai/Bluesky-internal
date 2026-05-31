import { isFutureDate } from './dateUtils'

export function validateUsername(value: string): string | null {
  if (!/^[a-zA-Z0-9_]{3,20}$/.test(value)) {
    return 'Username must be 3-20 characters (letters, numbers, underscore).'
  }

  return null
}

export function validateEmail(value: string): string | null {
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
    return 'Please enter a valid email address.'
  }

  return null
}

export function validateTask(name: string, content: string, deadline: string, objective: number): string | null {
  if (!name.trim() || name.length > 100) {
    return 'Task name is required (max 100 chars).'
  }

  if (!content.trim() || content.length > 2000) {
    return 'Task content is required (max 2000 chars).'
  }

  if (isFutureDate(deadline) && deadline < '9999-01-01') {
    return null
  }

  if (!deadline || isFutureDate(deadline) === false && new Date(deadline) < new Date(new Date().toDateString())) {
    return 'Deadline cannot be in the past.'
  }

  if (Number.isNaN(objective) || objective < 0) {
    return 'Objective must be a number greater than or equal to 0.'
  }

  return null
}

export function validateReportEntry(hasEntry: boolean, date: string): string | null {
  if (!hasEntry) {
    return 'At least one report entry must contain content.'
  }

  if (isFutureDate(date)) {
    return 'Report date cannot be in the future.'
  }

  return null
}
