import { jsonRequest, requestJson } from './http'

export type AuthUser = {
  id: string
  username: string
  email: string
  permission: 'Manager' | 'TeamLeader' | 'TeamMember'
}

export type LoginPayload = {
  email: string
  password: string
}

export async function fetchCurrentSession(): Promise<AuthUser> {
  return requestJson<AuthUser>('/api/auth/me', { method: 'GET' })
}

export async function signInRequest(payload: LoginPayload): Promise<AuthUser> {
  return requestJson<AuthUser>('/api/auth/login', jsonRequest(payload, { method: 'POST' }))
}

export async function signOutRequest(): Promise<void> {
  return requestJson<void>('/api/auth/logout', { method: 'POST' })
}