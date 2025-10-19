import { useState, useEffect, useRef } from 'react'
import './DebugPanel.css'

export interface DebugEvent {
  id: string
  timestamp: number
  type: 'message' | 'api_request' | 'api_response' | 'action' | 'component' | 'session' | 'error'
  label: string
  data: any
  duration?: number
}

export interface DebugPanelProps {
  events: DebugEvent[]
  onClear?: () => void
  enabled?: boolean
}

export function DebugPanel({ events, onClear, enabled = true }: DebugPanelProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [filter, setFilter] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedEvent, setSelectedEvent] = useState<DebugEvent | null>(null)
  const logsEndRef = useRef<HTMLDivElement>(null)
  const [autoScroll, setAutoScroll] = useState(true)

  useEffect(() => {
    if (autoScroll && isOpen) {
      logsEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [events, autoScroll, isOpen])

  if (!enabled) return null

  const filteredEvents = events.filter(event => {
    const matchesFilter = filter === 'all' || event.type === filter
    const matchesSearch = searchQuery === '' ||
      event.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      JSON.stringify(event.data).toLowerCase().includes(searchQuery.toLowerCase())
    return matchesFilter && matchesSearch
  })

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'message': return '💬'
      case 'api_request': return '📤'
      case 'api_response': return '📥'
      case 'action': return '⚡'
      case 'component': return '🧩'
      case 'session': return '🔄'
      case 'error': return '❌'
      default: return '📝'
    }
  }

  const getEventColor = (type: string) => {
    switch (type) {
      case 'message': return '#3b82f6'
      case 'api_request': return '#8b5cf6'
      case 'api_response': return '#10b981'
      case 'action': return '#f59e0b'
      case 'component': return '#06b6d4'
      case 'session': return '#6366f1'
      case 'error': return '#ef4444'
      default: return '#6b7280'
    }
  }

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      fractionalSecondDigits: 3
    })
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const exportLogs = () => {
    const logsJson = JSON.stringify(filteredEvents, null, 2)
    const blob = new Blob([logsJson], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `debug-logs-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className={`debug-panel ${isOpen ? 'open' : 'closed'}`}>
      {/* Toggle Button */}
      <button
        className="debug-panel-toggle"
        onClick={() => setIsOpen(!isOpen)}
        title={isOpen ? 'Close Debug Panel' : 'Open Debug Panel'}
      >
        <span className="debug-panel-logo">🔍</span>
        <span className="debug-panel-title">ReaChat DevTools</span>
        <span className="debug-panel-badge">{events.length}</span>
        <span className="debug-panel-arrow">{isOpen ? '▼' : '▲'}</span>
      </button>

      {/* Panel Content */}
      {isOpen && (
        <div className="debug-panel-content">
          {/* Header Controls */}
          <div className="debug-panel-header">
            <div className="debug-panel-filters">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="debug-panel-select"
              >
                <option value="all">All Events ({events.length})</option>
                <option value="message">Messages</option>
                <option value="api_request">API Requests</option>
                <option value="api_response">API Responses</option>
                <option value="action">Actions</option>
                <option value="component">Components</option>
                <option value="session">Session</option>
                <option value="error">Errors</option>
              </select>

              <input
                type="text"
                placeholder="Search logs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="debug-panel-search"
              />
            </div>

            <div className="debug-panel-actions">
              <label className="debug-panel-checkbox">
                <input
                  type="checkbox"
                  checked={autoScroll}
                  onChange={(e) => setAutoScroll(e.target.checked)}
                />
                Auto-scroll
              </label>
              <button onClick={exportLogs} className="debug-panel-btn">
                Export
              </button>
              <button onClick={onClear} className="debug-panel-btn">
                Clear
              </button>
            </div>
          </div>

          {/* Logs Display */}
          <div className="debug-panel-logs">
            <div className="debug-panel-logs-inner">
              {filteredEvents.length === 0 ? (
                <div className="debug-panel-empty">
                  <span>No events to display</span>
                  {searchQuery && <span className="debug-panel-empty-hint">Try adjusting your search or filter</span>}
                </div>
              ) : (
                filteredEvents.map((event) => (
                  <div
                    key={event.id}
                    className={`debug-event ${selectedEvent?.id === event.id ? 'selected' : ''}`}
                    onClick={() => setSelectedEvent(selectedEvent?.id === event.id ? null : event)}
                  >
                    <div className="debug-event-header">
                      <span
                        className="debug-event-icon"
                        style={{ color: getEventColor(event.type) }}
                      >
                        {getEventIcon(event.type)}
                      </span>
                      <span className="debug-event-time">{formatTimestamp(event.timestamp)}</span>
                      <span className="debug-event-type" style={{ color: getEventColor(event.type) }}>
                        {event.type.replace('_', ' ').toUpperCase()}
                      </span>
                      <span className="debug-event-label">{event.label}</span>
                      {event.duration && (
                        <span className="debug-event-duration">{event.duration}ms</span>
                      )}
                      <button
                        className="debug-event-copy"
                        onClick={(e) => {
                          e.stopPropagation()
                          copyToClipboard(JSON.stringify(event, null, 2))
                        }}
                        title="Copy event"
                      >
                        📋
                      </button>
                    </div>

                    {selectedEvent?.id === event.id && (
                      <div className="debug-event-details">
                        <pre className="debug-event-json">
                          {JSON.stringify(event.data, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                ))
              )}
              <div ref={logsEndRef} />
            </div>
          </div>

          {/* Footer Stats */}
          <div className="debug-panel-footer">
            <span className="debug-panel-stat">
              Total: {events.length} events
            </span>
            <span className="debug-panel-stat">
              Filtered: {filteredEvents.length} events
            </span>
            {events.length > 0 && (
              <span className="debug-panel-stat">
                Latest: {formatTimestamp(events[events.length - 1].timestamp)}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
