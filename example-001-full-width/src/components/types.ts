export type MessageRole = 'assistant' | 'user'

export interface Message {
  id: number
  role: MessageRole
  text: string
  timestamp?: Date
  isEditing?: boolean
  reactions?: MessageReaction[]
}

export interface MessageReaction {
  type: 'like' | 'dislike'
  timestamp: Date
}

export interface ChatMode {
  variant: 'default' | 'compact'
  showAvatars: boolean
  showTimestamps: boolean
}
