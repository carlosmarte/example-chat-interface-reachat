import { useState } from 'react'
import type { ChatSession, CustomGroup } from '../types/session'
import { groupSessionsByDate } from '../utils/sessionUtils'
import { organizeSessionsByCustomGroups } from '../utils/customGroupUtils'
import { SessionItem } from './SessionItem'
import { CustomGroupManager } from './CustomGroupManager'
import './SessionsList.css'

interface SessionsListProps {
  sessions: ChatSession[]
  currentSessionId: string
  customGroups: CustomGroup[]
  onSelectSession: (sessionId: string) => void
  onDeleteSession: (sessionId: string) => void
  onNewSession: () => void
  onCreateGroup: (name: string, color: string, icon: string) => void
  onUpdateGroup: (groupId: string, updates: Partial<CustomGroup>) => void
  onDeleteGroup: (groupId: string) => void
  onAssignSessionToGroup: (sessionId: string, groupId: string | null) => void
}

export function SessionsList({
  sessions,
  currentSessionId,
  customGroups,
  onSelectSession,
  onDeleteSession,
  onNewSession,
  onCreateGroup,
  onUpdateGroup,
  onDeleteGroup,
  onAssignSessionToGroup,
}: SessionsListProps) {
  const [showGroupManager, setShowGroupManager] = useState(false)

  // Organize sessions by custom groups
  const { customGroupedSessions, ungroupedSessions } = organizeSessionsByCustomGroups(
    sessions,
    customGroups
  )

  // Group ungrouped sessions by date
  const dateGroupedSessions = groupSessionsByDate(ungroupedSessions)

  return (
    <>
      <div className="sessions-list">
        <div className="sessions-list-header">
          <button
            className="new-session-btn"
            onClick={onNewSession}
            title="New chat"
            aria-label="Create new chat session"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <span>New Chat</span>
          </button>
        </div>

        <div className="sessions-list-content">
          {sessions.length === 0 ? (
            <div className="sessions-list-empty">
              <p>No sessions yet</p>
              <span>Start a new conversation</span>
            </div>
          ) : (
            <>
              {/* Custom Groups Section */}
              {customGroupedSessions.length > 0 && (
                <>
                  {customGroupedSessions.map(({ group, sessions: groupSessions }) => (
                    groupSessions.length > 0 && (
                      <div key={group.id} className="session-group">
                        <div className="session-group-label custom-group-label">
                          <span className="group-icon">{group.icon}</span>
                          <span>{group.name}</span>
                          <div
                            className="group-color-badge"
                            style={{ backgroundColor: group.color }}
                          />
                        </div>
                        <div className="session-group-items">
                          {groupSessions.map((session) => (
                            <SessionItem
                              key={session.id}
                              session={session}
                              isActive={session.id === currentSessionId}
                              onSelect={() => onSelectSession(session.id)}
                              onDelete={() => onDeleteSession(session.id)}
                              customGroups={customGroups}
                              onAssignToGroup={onAssignSessionToGroup}
                            />
                          ))}
                        </div>
                      </div>
                    )
                  ))}
                </>
              )}

              {/* Date-based Groups for Ungrouped Sessions */}
              {dateGroupedSessions.length > 0 && (
                <>
                  {dateGroupedSessions.map((group) => (
                    <div key={group.label} className="session-group">
                      <div className="session-group-label">{group.label}</div>
                      <div className="session-group-items">
                        {group.sessions.map((session) => (
                          <SessionItem
                            key={session.id}
                            session={session}
                            isActive={session.id === currentSessionId}
                            onSelect={() => onSelectSession(session.id)}
                            onDelete={() => onDeleteSession(session.id)}
                            customGroups={customGroups}
                            onAssignToGroup={onAssignSessionToGroup}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </>
              )}
            </>
          )}
        </div>

        <div className="sessions-list-footer">
          <button
            className="manage-groups-btn"
            onClick={() => setShowGroupManager(true)}
            title="Manage groups"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M12 15v6M6 9h3M6 15h3M6 21h12a2 2 0 002-2V5a2 2 0 00-2-2H6a2 2 0 00-2 2v14a2 2 0 002 2zM15 3v18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span>Manage Groups</span>
          </button>
        </div>
      </div>

      {/* Group Manager Modal */}
      {showGroupManager && (
        <>
          <div className="modal-overlay" onClick={() => setShowGroupManager(false)} />
          <CustomGroupManager
            groups={customGroups}
            onCreateGroup={onCreateGroup}
            onUpdateGroup={onUpdateGroup}
            onDeleteGroup={onDeleteGroup}
            onClose={() => setShowGroupManager(false)}
          />
        </>
      )}
    </>
  )
}
