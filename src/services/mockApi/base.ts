export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  statusCode: number
}

export const STORAGE_KEYS = {
  USERS: 'bluesky_users',
  TEAMS: 'bluesky_teams',
  TASKS: 'bluesky_tasks',
  REPORTS: 'bluesky_reports',
  CURRENT_USER: 'bluesky_current_user',
} as const

export const delay = (ms = 300): Promise<void> =>
  new Promise((resolve) => {
    setTimeout(resolve, ms)
  })

export const simulateError = (errorRate = 0.05): void => {
  if (Math.random() < errorRate) {
    throw new Error('Simulated network error. Please try again.')
  }
}

export const generateId = (prefix: string): string =>
  `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`

export const apiHandler = async <T>(operation: () => T, customDelay?: number): Promise<T> => {
  await delay(customDelay ?? 300 + Math.floor(Math.random() * 200))
  simulateError(0.05)
  return operation()
}
