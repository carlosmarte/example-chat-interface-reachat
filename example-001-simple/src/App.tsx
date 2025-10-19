import { type FormEvent, useState } from 'react'
import './App.css'
import { sendMessage, isAIConfigured, getAIProvider } from './ai'

type Message = {
  id: number
  role: 'assistant' | 'user'
  text: string
}

function App() {
  const aiConfigured = isAIConfigured()
  const aiProvider = getAIProvider()

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      role: 'assistant',
      text: aiConfigured
        ? `Hello! I'm ReaChat powered by ${aiProvider === 'openai' ? 'OpenAI' : 'Anthropic'}. How can I help you today?`
        : 'Hello! I am ReaChat. Please configure your API keys in .env to use AI features. For now, I will echo your messages back.',
    },
  ])
  const [draft, setDraft] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSend = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
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
    }
    setMessages((current) => [...current, assistantMessage])

    try {
      if (!aiConfigured) {
        // Fallback echo mode
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

  return (
    <div className="chat-app">
      <header className="chat-header">
        <h1>ReaChat</h1>
        <span>Hello world demo</span>
      </header>

      <main className="chat-thread">
        {messages.map((message) => (
          <article
            key={message.id}
            className={`chat-bubble ${message.role === 'user' ? 'is-user' : ''}`}
            aria-label={`${message.role} message`}
          >
            <span className="chat-role">
              {message.role === 'user' ? 'You' : 'ReaChat'}
            </span>
            <p>{message.text || <span className="loading-dots">...</span>}</p>
          </article>
        ))}
        {error && (
          <div className="error-message" role="alert">
            <strong>Error:</strong> {error}
          </div>
        )}
      </main>

      <form className="chat-composer" onSubmit={handleSend}>
        <label className="sr-only" htmlFor="chat-input">
          Type a message
        </label>
        <input
          id="chat-input"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="Send ReaChat a message..."
          disabled={isLoading}
        />
        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Sending...' : 'Send'}
        </button>
      </form>
    </div>
  )
}

export default App
