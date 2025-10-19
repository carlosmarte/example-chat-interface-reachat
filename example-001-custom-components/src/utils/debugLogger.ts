import type { DebugEvent } from '../components/DebugPanel'

export type DebugEventType = 'message' | 'api_request' | 'api_response' | 'action' | 'component' | 'session' | 'error'

export class DebugLogger {
  private static events: DebugEvent[] = []
  private static listeners: Set<(events: DebugEvent[]) => void> = new Set()
  private static requestTimings: Map<string, number> = new Map()

  /**
   * Subscribe to debug events
   */
  static subscribe(callback: (events: DebugEvent[]) => void): () => void {
    this.listeners.add(callback)
    // Immediately call with current events
    callback([...this.events])

    // Return unsubscribe function
    return () => {
      this.listeners.delete(callback)
    }
  }

  /**
   * Notify all listeners of event changes
   */
  private static notify() {
    const eventsCopy = [...this.events]
    this.listeners.forEach(listener => listener(eventsCopy))
  }

  /**
   * Add a debug event
   */
  private static addEvent(type: DebugEventType, label: string, data: any, duration?: number) {
    const event: DebugEvent = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      type,
      label,
      data,
      duration
    }

    this.events.push(event)
    this.notify()

    // Keep only last 1000 events to prevent memory issues
    if (this.events.length > 1000) {
      this.events = this.events.slice(-1000)
    }

    return event
  }

  /**
   * Log a message event
   */
  static logMessage(role: 'user' | 'assistant', text: string, metadata?: any) {
    return this.addEvent(
      'message',
      `${role === 'user' ? '→' : '←'} ${role.toUpperCase()}: ${text.substring(0, 50)}${text.length > 50 ? '...' : ''}`,
      {
        role,
        text,
        length: text.length,
        metadata
      }
    )
  }

  /**
   * Start tracking an API request
   */
  static startApiRequest(url: string, method: string, body?: any): string {
    const requestId = `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    this.requestTimings.set(requestId, Date.now())

    this.addEvent(
      'api_request',
      `${method} ${url}`,
      {
        requestId,
        method,
        url,
        body,
        timestamp: Date.now()
      }
    )

    return requestId
  }

  /**
   * Log API response
   */
  static logApiResponse(requestId: string, status: number, data: any, error?: any) {
    const startTime = this.requestTimings.get(requestId)
    const duration = startTime ? Date.now() - startTime : undefined

    if (startTime) {
      this.requestTimings.delete(requestId)
    }

    this.addEvent(
      error ? 'error' : 'api_response',
      `Response ${status}${error ? ' (ERROR)' : ''}`,
      {
        requestId,
        status,
        data,
        error,
        success: !error && status >= 200 && status < 300
      },
      duration
    )
  }

  /**
   * Log a user action
   */
  static logAction(action: string, target?: string, data?: any) {
    return this.addEvent(
      'action',
      `${action}${target ? ` → ${target}` : ''}`,
      {
        action,
        target,
        data
      }
    )
  }

  /**
   * Log a component event
   */
  static logComponent(componentName: string, event: string, props?: any) {
    return this.addEvent(
      'component',
      `<${componentName}> ${event}`,
      {
        componentName,
        event,
        props
      }
    )
  }

  /**
   * Log a session event
   */
  static logSession(event: string, sessionId?: string, data?: any) {
    return this.addEvent(
      'session',
      `Session: ${event}`,
      {
        event,
        sessionId,
        data
      }
    )
  }

  /**
   * Log an error
   */
  static logError(message: string, error: Error | any, context?: any) {
    return this.addEvent(
      'error',
      `ERROR: ${message}`,
      {
        message,
        error: error instanceof Error ? {
          name: error.name,
          message: error.message,
          stack: error.stack
        } : error,
        context
      }
    )
  }

  /**
   * Clear all events
   */
  static clear() {
    this.events = []
    this.requestTimings.clear()
    this.notify()
  }

  /**
   * Get all events
   */
  static getEvents(): DebugEvent[] {
    return [...this.events]
  }

  /**
   * Get events by type
   */
  static getEventsByType(type: DebugEventType): DebugEvent[] {
    return this.events.filter(event => event.type === type)
  }

  /**
   * Get recent events (last N)
   */
  static getRecentEvents(count: number = 10): DebugEvent[] {
    return this.events.slice(-count)
  }

  /**
   * Export events as JSON
   */
  static exportAsJSON(): string {
    return JSON.stringify(this.events, null, 2)
  }

  /**
   * Get statistics
   */
  static getStats() {
    const stats = {
      total: this.events.length,
      byType: {} as Record<string, number>,
      errors: 0,
      averageResponseTime: 0
    }

    let totalResponseTime = 0
    let responseCount = 0

    this.events.forEach(event => {
      stats.byType[event.type] = (stats.byType[event.type] || 0) + 1

      if (event.type === 'error') {
        stats.errors++
      }

      if (event.type === 'api_response' && event.duration) {
        totalResponseTime += event.duration
        responseCount++
      }
    })

    if (responseCount > 0) {
      stats.averageResponseTime = Math.round(totalResponseTime / responseCount)
    }

    return stats
  }
}

// Global debug logger instance
export const debugLogger = DebugLogger

// Browser console helper
if (typeof window !== 'undefined') {
  (window as any).debugLogger = DebugLogger
}
