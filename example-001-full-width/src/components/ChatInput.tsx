import { type FormEvent, type KeyboardEvent, useState } from 'react'
import './ChatInput.css'

interface ChatInputProps {
  value: string
  onChange: (value: string) => void
  onSubmit: () => void
  disabled?: boolean
  placeholder?: string
  variant?: 'default' | 'compact'
}

export function ChatInput({
  value,
  onChange,
  onSubmit,
  disabled = false,
  placeholder = 'Send a message...',
  variant = 'default',
}: ChatInputProps) {
  const [isFocused, setIsFocused] = useState(false)

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!value.trim() || disabled) return
    onSubmit()
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      if (value.trim() && !disabled) {
        onSubmit()
      }
    }
  }

  return (
    <form
      className={`chat-input chat-input--${variant} ${isFocused ? 'is-focused' : ''} ${disabled ? 'is-disabled' : ''}`}
      onSubmit={handleSubmit}
    >
      <div className="chat-input-wrapper">
        <label className="sr-only" htmlFor="chat-input-field">
          Type a message
        </label>
        <textarea
          id="chat-input-field"
          className="chat-input-field"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          disabled={disabled}
          rows={1}
          style={{
            minHeight: variant === 'compact' ? '36px' : '44px',
            maxHeight: '200px',
          }}
          onInput={(e) => {
            const target = e.target as HTMLTextAreaElement
            target.style.height = 'auto'
            target.style.height = `${Math.min(target.scrollHeight, 200)}px`
          }}
        />
        <button
          type="submit"
          className="chat-input-submit"
          disabled={disabled || !value.trim()}
          aria-label="Send message"
        >
          {disabled ? (
            <svg
              className="spinner"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
            >
              <circle
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray="60"
                strokeDashoffset="30"
              />
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path
                d="M22 2L11 13"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M22 2L15 22L11 13L2 9L22 2Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </button>
      </div>
    </form>
  )
}
