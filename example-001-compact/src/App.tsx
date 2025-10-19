import { useState } from 'react'
import './App.css'
import { sendMessage, isAIConfigured, getAIProvider } from './ai'
import { MessageList, ChatInput } from './components'
import type { Message } from './components/types'

type ChatVariant = 'default' | 'compact'

function App() {
  const aiConfigured = isAIConfigured()
  const aiProvider = getAIProvider()

  // UI Settings
  const [variant, setVariant] = useState<ChatVariant>('default')
  const [showAvatars, setShowAvatars] = useState(true)
  const [showTimestamps, setShowTimestamps] = useState(true)

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      role: 'assistant',
      text: aiConfigured
        ? `Hello! I'm ReaChat powered by ${aiProvider === 'openai' ? 'OpenAI' : 'Anthropic'}. How can I help you today?`
        : 'Hello! I am ReaChat. Please configure your API keys in .env to use AI features. For now, I will echo your messages back.',
      timestamp: new Date(),
    },
  ])
  const [draft, setDraft] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSend = async () => {
    const trimmed = draft.trim()
    if (!trimmed || isLoading) {
      return
    }

    setError(null)
    const nextId = messages.length > 0 ? messages[messages.length - 1].id : 1
    const userMessage: Message = {
      id: nextId + 1,
      role: 'user',
      text: trimmed,
      timestamp: new Date(),
    }

    // Add user message
    setMessages((current) => [...current, userMessage])
    setDraft('')
    setIsLoading(true)

    // Create placeholder for assistant message
    const assistantMessageId = nextId + 2
    const assistantMessage: Message = {
      id: assistantMessageId,
      role: 'assistant',
      text: '',
      timestamp: new Date(),
    }
    setMessages((current) => [...current, assistantMessage])

    try {
      if (!aiConfigured) {
        // Fallback echo mode
        await new Promise((resolve) => setTimeout(resolve, 1000))
        setMessages((current) =>
          current.map((msg) =>
            msg.id === assistantMessageId
              ? { ...msg, text: `ReaChat heard: "${trimmed}". Hello world!` }
              : msg
          )
        )
      } else {
        // Use AI API
        const conversationHistory = [...messages, userMessage].map((msg) => ({
          role: msg.role,
          content: msg.text,
        }))

        await sendMessage(conversationHistory, (chunk) => {
          setMessages((current) =>
            current.map((msg) =>
              msg.id === assistantMessageId
                ? { ...msg, text: msg.text + chunk }
                : msg
            )
          )
        })
      }
    } catch (err) {
      console.error('Error sending message:', err)
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to send message'
      setError(errorMessage)
      // Remove the empty assistant message on error
      setMessages((current) =>
        current.filter((msg) => msg.id !== assistantMessageId)
      )
    } finally {
      setIsLoading(false)
    }
  }

  const handleEditMessage = (id: number, newText: string) => {
    setMessages((current) =>
      current.map((msg) => (msg.id === id ? { ...msg, text: newText } : msg))
    )
  }

  const handleCopyMessage = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const handleRegenerateMessage = async (id: number) => {
    // Find the message and the user message before it
    const messageIndex = messages.findIndex((m) => m.id === id)
    if (messageIndex === -1 || messageIndex === 0) return

    const userMessage = messages[messageIndex - 1]
    if (userMessage.role !== 'user') return

    // Remove the assistant message and regenerate
    setMessages((current) => current.filter((m) => m.id !== id))
    setError(null)
    setIsLoading(true)

    const assistantMessage: Message = {
      id,
      role: 'assistant',
      text: '',
      timestamp: new Date(),
    }
    setMessages((current) => [...current, assistantMessage])

    try {
      if (!aiConfigured) {
        await new Promise((resolve) => setTimeout(resolve, 1000))
        setMessages((current) =>
          current.map((msg) =>
            msg.id === id
              ? {
                  ...msg,
                  text: `ReaChat heard: "${userMessage.text}". Hello world! (Regenerated)`,
                }
              : msg
          )
        )
      } else {
        const conversationHistory = messages
          .slice(0, messageIndex)
          .map((msg) => ({
            role: msg.role,
            content: msg.text,
          }))

        await sendMessage(conversationHistory, (chunk) => {
          setMessages((current) =>
            current.map((msg) =>
              msg.id === id ? { ...msg, text: msg.text + chunk } : msg
            )
          )
        })
      }
    } catch (err) {
      console.error('Error regenerating message:', err)
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to regenerate message'
      setError(errorMessage)
      setMessages((current) => current.filter((msg) => msg.id !== id))
    } finally {
      setIsLoading(false)
    }
  }

  const handleReaction = (id: number, type: 'like' | 'dislike') => {
    console.log(`Reaction ${type} for message ${id}`)
    // You can implement reaction storage/tracking here
  }

  return (
    <div className="chat-app">
      <header className="chat-header">
        <div className="chat-header-title">
          <h1>ReaChat</h1>
          <span className="chat-header-subtitle">
            {aiConfigured
              ? `Powered by ${aiProvider === 'openai' ? 'OpenAI' : 'Anthropic'}`
              : 'Demo Mode'}
          </span>
        </div>

        <div className="chat-header-controls">
          <button
            className={`control-btn ${variant === 'default' ? 'active' : ''}`}
            onClick={() => setVariant('default')}
            title="Default view"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2" />
              <rect x="14" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2" />
              <rect x="3" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2" />
              <rect x="14" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2" />
            </svg>
          </button>
          <button
            className={`control-btn ${variant === 'compact' ? 'active' : ''}`}
            onClick={() => setVariant('compact')}
            title="Compact view"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <line x1="4" y1="6" x2="20" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <line x1="4" y1="12" x2="20" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <line x1="4" y1="18" x2="20" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
          <button
            className={`control-btn ${showAvatars ? 'active' : ''}`}
            onClick={() => setShowAvatars(!showAvatars)}
            title="Toggle avatars"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="2" />
              <path d="M6 21v-2a4 4 0 014-4h4a4 4 0 014 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
          <button
            className={`control-btn ${showTimestamps ? 'active' : ''}`}
            onClick={() => setShowTimestamps(!showTimestamps)}
            title="Toggle timestamps"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
              <path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </header>

      <main className="chat-main">
        <MessageList
          messages={messages}
          isLoading={isLoading}
          error={error}
          variant={variant}
          showAvatars={showAvatars}
          showTimestamps={showTimestamps}
          onEditMessage={handleEditMessage}
          onCopyMessage={handleCopyMessage}
          onRegenerateMessage={handleRegenerateMessage}
          onReaction={handleReaction}
        />
      </main>

      <footer className="chat-footer">
        <ChatInput
          value={draft}
          onChange={setDraft}
          onSubmit={handleSend}
          disabled={isLoading}
          placeholder="Send ReaChat a message..."
          variant={variant}
        />
      </footer>
    </div>
  )
}

export default App
