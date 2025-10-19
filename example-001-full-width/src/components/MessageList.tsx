import { useEffect, useRef } from 'react'
import { Message } from './Message'
import { TypingIndicator } from './TypingIndicator'
import type { Message as MessageType } from './types'
import './MessageList.css'

interface MessageListProps {
  messages: MessageType[]
  isLoading?: boolean
  error?: string | null
  variant?: 'default' | 'compact'
  showAvatars?: boolean
  showTimestamps?: boolean
  onEditMessage?: (id: number, newText: string) => void
  onCopyMessage?: (text: string) => void
  onRegenerateMessage?: (id: number) => void
  onReaction?: (id: number, type: 'like' | 'dislike') => void
}

export function MessageList({
  messages,
  isLoading = false,
  error = null,
  variant = 'default',
  showAvatars = true,
  showTimestamps = true,
  onEditMessage,
  onCopyMessage,
  onRegenerateMessage,
  onReaction,
}: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  return (
    <div className={`message-list message-list--${variant}`}>
      {messages.map((message) => (
        <Message
          key={message.id}
          message={message}
          variant={variant}
          showAvatar={showAvatars}
          showTimestamp={showTimestamps}
          onEdit={onEditMessage}
          onCopy={onCopyMessage}
          onRegenerate={onRegenerateMessage}
          onReaction={onReaction}
        />
      ))}

      {isLoading && <TypingIndicator variant={variant} showAvatar={showAvatars} />}

      {error && (
        <div className="message-list-error" role="alert">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
            <line x1="12" y1="8" x2="12" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <line x1="12" y1="16" x2="12.01" y2="16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <div className="message-list-error-content">
            <strong>Error</strong>
            <span>{error}</span>
          </div>
        </div>
      )}

      <div ref={messagesEndRef} />
    </div>
  )
}
