export type TaskStatus = 'in-progress' | 'completed'

export interface Task {
  id: string
  name: string
  content: string
  deadline: string
  objective: number
  teamId: string
  status: TaskStatus
  createdBy: string
  createdAt: string
  updatedAt: string
}

export interface TaskWithDetails extends Task {
  teamName: string
  creatorName: string
}

export interface TaskInput {
  name: string
  content: string
  deadline: string
  objective: number
  teamId: string
  status?: TaskStatus
}
