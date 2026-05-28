import type { CreateUserPayload, ManagedUser } from '../Page/User/Table'
import { jsonRequest, requestJson } from './http'

export async function fetchUsers(): Promise<ManagedUser[]> {
  return requestJson<ManagedUser[]>('/api/users', { method: 'GET' })
}

export async function createUser(payload: CreateUserPayload): Promise<ManagedUser> {
  return requestJson<ManagedUser>('/api/users', jsonRequest(payload, { method: 'POST' }))
}

export async function deleteUser(userId: string): Promise<void> {
  return requestJson<void>(`/api/users/${encodeURIComponent(userId)}`, { method: 'DELETE' })
}