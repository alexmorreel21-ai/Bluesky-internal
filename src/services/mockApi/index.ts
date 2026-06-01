import { STORAGE_KEYS } from './base'
import { initializeStorage } from './storage'

export * from './base'
export * from './users'
export * from './teams'
export * from './tasks'
export * from './reports'

export function initializeMockApi(): void {
  initializeStorage()
}

export function getCurrentUserId(): string | null {
  if (typeof window === 'undefined') {
    return null
  }

  return window.localStorage.getItem(STORAGE_KEYS.CURRENT_USER)
}

export function setCurrentUserId(userId: string): void {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem(STORAGE_KEYS.CURRENT_USER, userId)
}

export function clearCurrentUserId(): void {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.removeItem(STORAGE_KEYS.CURRENT_USER)
}
