import type { Message } from '../components/types'

export interface ChatSession {
  id: string
  title: string
  messages: Message[]
  createdAt: Date
  updatedAt: Date
  customGroupId?: string // Optional custom group assignment
  metadata?: Record<string, unknown>
}

export interface SessionGroup {
  label: string
  sessions: ChatSession[]
}

export type SessionGroupKey = 'today' | 'yesterday' | 'lastWeek' | 'lastMonth' | 'older'

// Custom group types
export interface CustomGroup {
  id: string
  name: string
  color?: string
  icon?: string
  createdAt: Date
  order: number
}

export interface CustomGroupWithSessions {
  group: CustomGroup
  sessions: ChatSession[]
}
