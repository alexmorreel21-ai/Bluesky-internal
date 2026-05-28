export type Permission = 'Manager' | 'TeamLeader' | 'TeamMember'

export type ManagedUser = {
  id: string
  username: string
  email: string
  password?: string
  permission: Permission
  status: 'ACTIVE' | 'INVITED'
}

export type CreateUserPayload = {
  username: string
  email: string
  password: string
  permission: Permission
}

export type UserRecord = {
  id: string
  username: string
  email: string
  permission: Permission
}

export type TeamMember = {
  id: string
  userId: string
  username: string
  email: string
}

export type TeamRecord = {
  id: string
  name: string
  leaderId: string
  leaderName: string
  members: TeamMember[]
}

export type TeamPayload = {
  name: string
  leaderId: string
}

export type TeamMemberPayload = {
  userId: string
}
