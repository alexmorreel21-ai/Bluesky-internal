export type UserRole = 'admin' | 'manager' | 'dev'

export interface User {
  id: string
  username: string
  email: string
  password: string
  role: UserRole
  createdAt: string
  updatedAt: string
}

export interface UserInput {
  username: string
  email: string
  password: string
  role: UserRole
}
