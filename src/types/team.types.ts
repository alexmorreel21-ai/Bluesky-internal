export interface Team {
  id: string
  name: string
  leaderId: string
  memberIds: string[]
  createdAt: string
  updatedAt: string
}

export interface TeamWithDetails extends Team {
  leaderName: string
  leaderRole: string
  memberNames: string[]
}

export interface TeamInput {
  name: string
  leaderId: string
  memberIds: string[]
}
