import { useState, useEffect } from 'react'
import './App.css'
import { sendMessage, isAIConfigured, getAIProvider } from './ai'
import { MessageList, ChatInput, SessionsList } from './components'
import type { Message, FileAttachment } from './components/types'
import type { ChatSession, CustomGroup } from './types/session'
import {
  createNewSession,
  generateSessionTitle,
  loadSessions,
  saveSessions,
} from './utils/sessionUtils'
import {
  createCustomGroup,
  loadCustomGroups,
  saveCustomGroups,
} from './utils/customGroupUtils'
import { parseMessage, hasParseableSyntax } from './utils/messageParser'
import { injectActions, shouldSkipInjection } from './utils/actionInjector'
// Import custom components to auto-register them
import './components/custom'
import { DebugPanel } from './components/DebugPanel'
import type { DebugEvent } from './components/DebugPanel'
import { debugLogger } from './utils/debugLogger'

type ChatVariant = 'default' | 'compact'

function App() {
  const aiConfigured = isAIConfigured()
  const aiProvider = getAIProvider()

  // UI Settings
  const [variant, setVariant] = useState<ChatVariant>('default')
  const [showAvatars, setShowAvatars] = useState(true)
  const [showTimestamps, setShowTimestamps] = useState(true)
  const [isFullScreen, setIsFullScreen] = useState(false)
  const [showSidebar, setShowSidebar] = useState(true)

  // Session Management
  const [sessions, setSessions] = useState<ChatSession[]>([])
  const [currentSessionId, setCurrentSessionId] = useState<string>('')

  // Custom Groups
  const [customGroups, setCustomGroups] = useState<CustomGroup[]>([])

  const [draft, setDraft] = useState('')
  const [attachments, setAttachments] = useState<FileAttachment[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Debug Panel
  const [debugEvents, setDebugEvents] = useState<DebugEvent[]>([])
  const [debugEnabled, setDebugEnabled] = useState(true)

  // Get current session
  const currentSession = sessions.find(s => s.id === currentSessionId)
  const messages = currentSession?.messages || []

  // Protected messages configuration
  const [protectedMessageIds, setProtectedMessageIds] = useState<Set<number>>(new Set([1])) // Protect first message by default

  // Utility functions to manage protected messages
  const protectMessage = (id: number) => {
    setProtectedMessageIds(prev => new Set(prev).add(id))
  }

  const unprotectMessage = (id: number) => {
    setProtectedMessageIds(prev => {
      const newSet = new Set(prev)
      newSet.delete(id)
      return newSet
    })
  }

  const protectMessagesByIds = (ids: number[]) => {
    setProtectedMessageIds(prev => new Set([...prev, ...ids]))
  }

  const isMessageProtected = (id: number) => {
    return protectedMessageIds.has(id)
  }

  // Check message protection based on metadata
  const isProtectedByMetadata = (message: Message): boolean => {
    if (!message.metadata) return false
    // Example: Protect messages with specific metadata flags
    return message.metadata.protected === true || message.metadata.system === true
  }

  // Apply protection flags to messages
  useEffect(() => {
    updateCurrentSessionMessages(currentMessages =>
      currentMessages.map(msg => ({
        ...msg,
        isEditable: !isMessageProtected(msg.id) && !isProtectedByMetadata(msg),
        isDeletable: !isMessageProtected(msg.id) && !isProtectedByMetadata(msg),
      }))
    )
  }, [protectedMessageIds, currentSessionId])

  // Expose protection utilities for development/testing (optional)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).chatProtection = {
        protectMessage,
        unprotectMessage,
        protectMessagesByIds,
        isMessageProtected,
        getProtectedIds: () => Array.from(protectedMessageIds),
      }
    }

    return () => {
      if (typeof window !== 'undefined') {
        delete (window as any).chatProtection
      }
    }
  }, [protectedMessageIds])

  // Expose custom component utilities for development/testing
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).customComponents = {
        // Add a message with a custom component using registry
        addCodeBlock: (code: string, language?: string) => {
          const nextId = messages.length > 0 ? messages[messages.length - 1].id + 1 : 1
          updateCurrentSessionMessages((current) => [
            ...current,
            {
              id: nextId,
              role: 'assistant' as const,
              text: '',
              timestamp: new Date(),
              componentName: 'CodeBlock',
              componentProps: { code, language }
            }
          ])
        },
        addActionCard: (title: string, description?: string, variant?: string) => {
          const nextId = messages.length > 0 ? messages[messages.length - 1].id + 1 : 1
          updateCurrentSessionMessages((current) => [
            ...current,
            {
              id: nextId,
              role: 'assistant' as const,
              text: '',
              timestamp: new Date(),
              componentName: 'ActionCard',
              componentProps: {
                title,
                description,
                variant,
                buttonText: 'Click Me',
                onAction: () => alert('Action clicked!')
              }
            }
          ])
        },
        addDataTable: (columns: any[], data: any[], title?: string) => {
          const nextId = messages.length > 0 ? messages[messages.length - 1].id + 1 : 1
          updateCurrentSessionMessages((current) => [
            ...current,
            {
              id: nextId,
              role: 'assistant' as const,
              text: '',
              timestamp: new Date(),
              componentName: 'DataTable',
              componentProps: { columns, data, title }
            }
          ])
        },
        addCustomContainer: (content: string, variant?: string, title?: string) => {
          const nextId = messages.length > 0 ? messages[messages.length - 1].id + 1 : 1
          updateCurrentSessionMessages((current) => [
            ...current,
            {
              id: nextId,
              role: 'assistant' as const,
              text: '',
              timestamp: new Date(),
              componentName: 'CustomContainer',
              componentProps: {
                children: content,
                variant,
                title
              }
            }
          ])
        },
        addRadioGroup: (title: string, options: any[], variant?: string) => {
          const nextId = messages.length > 0 ? messages[messages.length - 1].id + 1 : 1
          updateCurrentSessionMessages((current) => [
            ...current,
            {
              id: nextId,
              role: 'assistant' as const,
              text: '',
              timestamp: new Date(),
              componentName: 'RadioGroup',
              componentProps: {
                title,
                options,
                variant,
                onSelect: (value: string) => console.log('Selected:', value)
              }
            }
          ])
        },
        addList: (items: any[], title?: string, variant?: string) => {
          const nextId = messages.length > 0 ? messages[messages.length - 1].id + 1 : 1
          updateCurrentSessionMessages((current) => [
            ...current,
            {
              id: nextId,
              role: 'assistant' as const,
              text: '',
              timestamp: new Date(),
              componentName: 'List',
              componentProps: {
                items,
                title,
                variant,
                onItemClick: (item: any) => console.log('Clicked:', item)
              }
            }
          ])
        },
        addLivePreview: (html: string, title?: string, defaultTab?: 'preview' | 'code', height?: number) => {
          const nextId = messages.length > 0 ? messages[messages.length - 1].id + 1 : 1
          updateCurrentSessionMessages((current) => [
            ...current,
            {
              id: nextId,
              role: 'assistant' as const,
              text: '',
              timestamp: new Date(),
              componentName: 'LivePreview',
              componentProps: {
                html,
                title,
                defaultTab,
                height
              }
            }
          ])
        }
      }
    }

    return () => {
      if (typeof window !== 'undefined') {
        delete (window as any).customComponents
      }
    }
  }, [messages, currentSessionId])

  // Initialize custom groups from localStorage
  useEffect(() => {
    const loaded = loadCustomGroups()
    setCustomGroups(loaded)
  }, [])

  // Subscribe to debug logger
  useEffect(() => {
    debugLogger.logSession('App mounted', currentSessionId)

    const unsubscribe = debugLogger.subscribe((events) => {
      setDebugEvents(events)
    })

    return () => {
      debugLogger.logSession('App unmounted', currentSessionId)
      unsubscribe()
    }
  }, [])

  // Initialize sessions from localStorage
  useEffect(() => {
    const loaded = loadSessions()
    if (loaded.length > 0) {
      setSessions(loaded)
      setCurrentSessionId(loaded[0].id)
    } else {
      // Create initial session with welcome message
      const initialSession = createNewSession()
      initialSession.title = 'Welcome'
      initialSession.messages = [
        {
          id: 1,
          role: 'assistant',
          text: aiConfigured
            ? `Hello! I'm ReaChat powered by ${aiProvider === 'openai' ? 'OpenAI' : 'Anthropic'}. How can I help you today?`
            : 'Hello! I am ReaChat. Please configure your API keys in .env to use AI features. For now, I will echo your messages back.',
          timestamp: new Date(),
        },
      ]
      setSessions([initialSession])
      setCurrentSessionId(initialSession.id)
    }
  }, [aiConfigured, aiProvider])

  // Save sessions to localStorage whenever they change
  useEffect(() => {
    if (sessions.length > 0) {
      saveSessions(sessions)
    }
  }, [sessions])

  // Handle escape key to exit fullscreen
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isFullScreen) {
        setIsFullScreen(false)
      }
    }

    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [isFullScreen])

  // Prevent body scroll when fullscreen
  useEffect(() => {
    if (isFullScreen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }

    return () => {
      document.body.style.overflow = ''
    }
  }, [isFullScreen])

  // Session Management Functions
  const updateCurrentSessionMessages = (updater: (messages: Message[]) => Message[]) => {
    setSessions(prevSessions =>
      prevSessions.map(session =>
        session.id === currentSessionId
          ? {
              ...session,
              messages: updater(session.messages),
              updatedAt: new Date(),
              title: session.messages.length === 0 ? generateSessionTitle(updater(session.messages)) : session.title,
            }
          : session
      )
    )
  }

  const handleNewSession = () => {
    const newSession = createNewSession()
    newSession.messages = [
      {
        id: 1,
        role: 'assistant',
        text: aiConfigured
          ? `Hello! I'm ReaChat powered by ${aiProvider === 'openai' ? 'OpenAI' : 'Anthropic'}. How can I help you today?`
          : 'Hello! I am ReaChat. Please configure your API keys in .env to use AI features. For now, I will echo your messages back.',
        timestamp: new Date(),
      },
    ]
    setSessions(prev => [newSession, ...prev])
    setCurrentSessionId(newSession.id)
    setDraft('')
    setAttachments([])
    setError(null)

    debugLogger.logSession('Created new session', newSession.id)
  }

  const handleSelectSession = (sessionId: string) => {
    debugLogger.logAction('Select session', sessionId, {
      previousSessionId: currentSessionId
    })

    setCurrentSessionId(sessionId)
    setDraft('')
    setAttachments([])
    setError(null)
  }

  const handleDeleteSession = (sessionId: string) => {
    debugLogger.logAction('Delete session', sessionId)

    setSessions(prev => {
      const filtered = prev.filter(s => s.id !== sessionId)
      if (filtered.length === 0) {
        // If deleting last session, create a new one
        const newSession = createNewSession()
        newSession.messages = [{
          id: 1,
          role: 'assistant',
          text: aiConfigured
            ? `Hello! I'm ReaChat powered by ${aiProvider === 'openai' ? 'OpenAI' : 'Anthropic'}. How can I help you today?`
            : 'Hello! I am ReaChat. Please configure your API keys in .env to use AI features. For now, I will echo your messages back.',
          timestamp: new Date(),
        }]
        setCurrentSessionId(newSession.id)
        return [newSession]
      }

      // If deleting current session, switch to first available
      if (sessionId === currentSessionId) {
        setCurrentSessionId(filtered[0].id)
      }

      return filtered
    })
  }

  const handleSend = async () => {
    const trimmed = draft.trim()
    if ((!trimmed && attachments.length === 0) || isLoading) {
      return
    }

    setError(null)
    const nextId = messages.length > 0 ? messages[messages.length - 1].id : 1

    // Parse user message for custom component syntax
    let userMessages: Message[]
    if (hasParseableSyntax(trimmed)) {
      userMessages = parseMessage(trimmed, {
        id: nextId + 1,
        role: 'user',
        attachments: attachments.length > 0 ? [...attachments] : undefined,
      })
    } else {
      userMessages = [{
        id: nextId + 1,
        role: 'user',
        text: trimmed,
        timestamp: new Date(),
        attachments: attachments.length > 0 ? [...attachments] : undefined,
      }]
    }

    // Log user message
    debugLogger.logMessage('user', trimmed, {
      attachments: attachments.length,
      hasCustomSyntax: hasParseableSyntax(trimmed),
      parsedMessages: userMessages.length
    })

    // Add user message(s)
    updateCurrentSessionMessages((current) => [...current, ...userMessages])
    setDraft('')
    setAttachments([])
    setIsLoading(true)

    // Create placeholder for assistant message (account for multiple parsed messages)
    const assistantMessageId = nextId + userMessages.length + 1
    const assistantMessage: Message = {
      id: assistantMessageId,
      role: 'assistant',
      text: '',
      timestamp: new Date(),
    }
    updateCurrentSessionMessages((current) => [...current, assistantMessage])

    try {
      if (!aiConfigured) {
        // Fallback echo mode
        await new Promise((resolve) => setTimeout(resolve, 1000))
        const echoText = `ReaChat heard: "${trimmed}". Hello world!`

        // Check if response contains parseable syntax
        if (hasParseableSyntax(echoText)) {
          const parsedMessages = parseMessage(echoText, {
            id: assistantMessageId,
            role: 'assistant'
          })

          updateCurrentSessionMessages((current) => {
            // Remove placeholder and add parsed messages
            const withoutPlaceholder = current.filter(msg => msg.id !== assistantMessageId)
            return [...withoutPlaceholder, ...parsedMessages]
          })
        } else {
          updateCurrentSessionMessages((current) =>
            current.map((msg) =>
              msg.id === assistantMessageId
                ? { ...msg, text: echoText }
                : msg
            )
          )
        }
      } else {
        // Use AI API - Send ORIGINAL text, not parsed messages
        // This ensures the AI receives the full content including code blocks as text
        // Filter out messages with empty text (component-only messages)
        const conversationHistory = [...messages]
          .filter(msg => msg.text && msg.text.trim().length > 0)
          .map((msg) => ({
            role: msg.role,
            content: msg.text,
          }))

        // Add the current user's original message (trimmed text)
        conversationHistory.push({
          role: 'user',
          content: trimmed
        })

        // Log API request
        const requestId = debugLogger.startApiRequest(
          'AI API',
          'POST',
          {
            provider: aiProvider,
            messageCount: conversationHistory.length,
            lastUserMessage: trimmed.substring(0, 100)
          }
        )

        let fullResponse = ''
        await sendMessage(conversationHistory, (chunk) => {
          fullResponse += chunk
          updateCurrentSessionMessages((current) =>
            current.map((msg) =>
              msg.id === assistantMessageId
                ? { ...msg, text: msg.text + chunk }
                : msg
            )
          )
        })

        // Log API response
        debugLogger.logApiResponse(requestId, 200, {
          responseLength: fullResponse.length,
          hasCustomSyntax: hasParseableSyntax(fullResponse),
          preview: fullResponse.substring(0, 100)
        })

        // Log assistant message (original)
        debugLogger.logMessage('assistant', fullResponse, {
          length: fullResponse.length,
          hasCustomSyntax: hasParseableSyntax(fullResponse)
        })

        // Inject action cards based on keywords (if applicable)
        let processedResponse = fullResponse
        if (!shouldSkipInjection(fullResponse)) {
          const { text: injectedText, injections } = injectActions(fullResponse)

          if (injections.length > 0) {
            processedResponse = injectedText
            debugLogger.logComponent('ActionInjector', 'injected actions', {
              originalLength: fullResponse.length,
              injectedLength: processedResponse.length,
              injectionsCount: injections.length,
              injections: injections.map(i => i.injection)
            })
          }
        }

        // After streaming is complete, check if response should be parsed
        if (hasParseableSyntax(processedResponse)) {
          const parsedMessages = parseMessage(processedResponse, {
            id: assistantMessageId,
            role: 'assistant'
          })

          debugLogger.logComponent('MessageParser', 'parsed response', {
            originalLength: processedResponse.length,
            parsedCount: parsedMessages.length
          })

          updateCurrentSessionMessages((current) => {
            // Replace the streamed message with parsed messages
            const withoutStreamed = current.filter(msg => msg.id !== assistantMessageId)
            return [...withoutStreamed, ...parsedMessages]
          })
        } else if (processedResponse !== fullResponse) {
          // If injections were added but no parsing needed, update the text
          updateCurrentSessionMessages((current) =>
            current.map((msg) =>
              msg.id === assistantMessageId
                ? { ...msg, text: processedResponse }
                : msg
            )
          )
        }
      }
    } catch (err) {
      console.error('Error sending message:', err)
      debugLogger.logError('Failed to send message', err, { trimmed, aiConfigured })
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to send message'
      setError(errorMessage)
      // Remove the empty assistant message on error
      updateCurrentSessionMessages((current) =>
        current.filter((msg) => msg.id !== assistantMessageId)
      )
    } finally {
      setIsLoading(false)
    }
  }

  const handleEditMessage = (id: number, newText: string) => {
    // Prevent editing protected messages
    if (isMessageProtected(id)) {
      console.warn('Cannot edit protected message:', id)
      return
    }

    updateCurrentSessionMessages((current) =>
      current.map((msg) => {
        if (msg.id === id && msg.isEditable !== false) {
          return { ...msg, text: newText }
        }
        return msg
      })
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
    updateCurrentSessionMessages((current) => current.filter((m) => m.id !== id))
    setError(null)
    setIsLoading(true)

    const assistantMessage: Message = {
      id,
      role: 'assistant',
      text: '',
      timestamp: new Date(),
    }
    updateCurrentSessionMessages((current) => [...current, assistantMessage])

    try {
      if (!aiConfigured) {
        await new Promise((resolve) => setTimeout(resolve, 1000))
        updateCurrentSessionMessages((current) =>
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
          updateCurrentSessionMessages((current) =>
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
      updateCurrentSessionMessages((current) => current.filter((msg) => msg.id !== id))
    } finally {
      setIsLoading(false)
    }
  }

  const handleReaction = (id: number, type: 'like' | 'dislike') => {
    console.log(`Reaction ${type} for message ${id}`)
    // You can implement reaction storage/tracking here
  }

  const handleDeleteMessage = (id: number) => {
    // Prevent deleting protected messages
    if (isMessageProtected(id)) {
      console.warn('Cannot delete protected message:', id)
      return
    }

    // Check if message is protected by metadata
    const message = messages.find(m => m.id === id)
    if (message && isProtectedByMetadata(message)) {
      console.warn('Cannot delete protected message:', id)
      return
    }

    // Remove the message from the current session
    updateCurrentSessionMessages((current) => current.filter((msg) => msg.id !== id))
  }

  // Custom Group Management Functions
  const handleCreateGroup = (name: string, color: string, icon: string) => {
    const newGroup = createCustomGroup(name, color, icon)
    const updated = [...customGroups, newGroup]
    setCustomGroups(updated)
    saveCustomGroups(updated)
  }

  const handleUpdateGroup = (groupId: string, updates: Partial<CustomGroup>) => {
    const updated = customGroups.map(g =>
      g.id === groupId ? { ...g, ...updates } : g
    )
    setCustomGroups(updated)
    saveCustomGroups(updated)
  }

  const handleDeleteGroup = (groupId: string) => {
    // Remove group assignment from all sessions in this group
    const updatedSessions = sessions.map(session =>
      session.customGroupId === groupId
        ? { ...session, customGroupId: undefined }
        : session
    )
    setSessions(updatedSessions)
    saveSessions(updatedSessions)

    // Delete the group
    const updated = customGroups.filter(g => g.id !== groupId)
    setCustomGroups(updated)
    saveCustomGroups(updated)
  }

  const handleAssignSessionToGroup = (sessionId: string, groupId: string | null) => {
    const updatedSessions = sessions.map(session =>
      session.id === sessionId
        ? { ...session, customGroupId: groupId || undefined }
        : session
    )
    setSessions(updatedSessions)
    saveSessions(updatedSessions)
  }

  return (
    <div className={`chat-app ${isFullScreen ? 'chat-app--fullscreen' : ''} ${showSidebar ? 'chat-app--with-sidebar' : ''}`}>
      {showSidebar && (
        <aside className="chat-sidebar">
          <SessionsList
            sessions={sessions}
            currentSessionId={currentSessionId}
            customGroups={customGroups}
            onSelectSession={handleSelectSession}
            onDeleteSession={handleDeleteSession}
            onNewSession={handleNewSession}
            onCreateGroup={handleCreateGroup}
            onUpdateGroup={handleUpdateGroup}
            onDeleteGroup={handleDeleteGroup}
            onAssignSessionToGroup={handleAssignSessionToGroup}
          />
        </aside>
      )}
      <div className="chat-content">
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
            className={`control-btn ${showSidebar ? 'active' : ''}`}
            onClick={() => setShowSidebar(!showSidebar)}
            title={showSidebar ? 'Hide sidebar' : 'Show sidebar'}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <line x1="9" y1="3" x2="9" y2="21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
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
          <button
            className={`control-btn ${isFullScreen ? 'active' : ''}`}
            onClick={() => setIsFullScreen(!isFullScreen)}
            title={isFullScreen ? 'Exit full screen' : 'Enter full screen'}
          >
            {isFullScreen ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M8 3v3a2 2 0 01-2 2H3m18 0h-3a2 2 0 01-2-2V3m0 18v-3a2 2 0 012-2h3M3 16h3a2 2 0 012 2v3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M8 3H5a2 2 0 00-2 2v3m18 0V5a2 2 0 00-2-2h-3m0 18h3a2 2 0 002-2v-3M3 16v3a2 2 0 002 2h3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </button>
          <button
            className={`control-btn ${debugEnabled ? 'active' : ''}`}
            onClick={() => setDebugEnabled(!debugEnabled)}
            title={debugEnabled ? 'Hide debug panel' : 'Show debug panel'}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
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
          onDeleteMessage={handleDeleteMessage}
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
          attachments={attachments}
          onAttachmentsChange={setAttachments}
          maxFileSize={10 * 1024 * 1024}
        />
      </footer>
      </div>

      {/* Debug Panel - TanStack DevTools style */}
      <DebugPanel
        events={debugEvents}
        onClear={() => debugLogger.clear()}
        enabled={debugEnabled}
      />
    </div>
  )
}

export default App
