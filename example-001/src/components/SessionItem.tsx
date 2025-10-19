import { useState, useRef, useEffect } from 'react'
import type { ChatSession, CustomGroup } from '../types/session'
import './SessionItem.css'

interface SessionItemProps {
  session: ChatSession
  isActive: boolean
  onSelect: () => void
  onDelete: () => void
  customGroups?: CustomGroup[]
  onAssignToGroup?: (sessionId: string, groupId: string | null) => void
}

export function SessionItem({
  session,
  isActive,
  onSelect,
  onDelete,
  customGroups = [],
  onAssignToGroup
}: SessionItemProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showGroupMenu, setShowGroupMenu] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // Close group menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowGroupMenu(false)
      }
    }

    if (showGroupMenu) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showGroupMenu])

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (showDeleteConfirm) {
      onDelete()
      setShowDeleteConfirm(false)
    } else {
      setShowDeleteConfirm(true)
      // Auto-hide confirmation after 3 seconds
      setTimeout(() => setShowDeleteConfirm(false), 3000)
    }
  }

  const handleCancelDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    setShowDeleteConfirm(false)
  }

  const handleGroupMenuToggle = (e: React.MouseEvent) => {
    e.stopPropagation()
    setShowGroupMenu(!showGroupMenu)
  }

  const handleAssignToGroup = (e: React.MouseEvent, groupId: string | null) => {
    e.stopPropagation()
    if (onAssignToGroup) {
      onAssignToGroup(session.id, groupId)
    }
    setShowGroupMenu(false)
  }

  return (
    <div
      className={`session-item ${isActive ? 'is-active' : ''} ${showDeleteConfirm ? 'is-confirming' : ''}`}
      onClick={onSelect}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false)
        setShowDeleteConfirm(false)
      }}
    >
      <div className="session-item-icon">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path
            d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      <div className="session-item-content">
        <span className="session-item-title">{session.title}</span>
      </div>

      {showDeleteConfirm ? (
        <div className="session-item-confirm">
          <button
            className="session-item-confirm-btn confirm"
            onClick={handleDelete}
            title="Confirm delete"
            aria-label="Confirm delete"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <polyline points="20 6 9 17 4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <button
            className="session-item-confirm-btn cancel"
            onClick={handleCancelDelete}
            title="Cancel"
            aria-label="Cancel delete"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      ) : (
        (isHovered || isActive) && (
          <div className="session-item-actions">
            {customGroups && customGroups.length > 0 && onAssignToGroup && (
              <div className="session-item-group-menu-container" ref={menuRef}>
                <button
                  className="session-item-action-btn"
                  onClick={handleGroupMenuToggle}
                  title="Assign to group"
                  aria-label="Assign to group"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
                {showGroupMenu && (
                  <div className="session-item-group-menu">
                    <button
                      className="group-menu-item"
                      onClick={(e) => handleAssignToGroup(e, null)}
                    >
                      <span>None</span>
                      {!session.customGroupId && <span className="check-mark">✓</span>}
                    </button>
                    {customGroups.map(group => (
                      <button
                        key={group.id}
                        className="group-menu-item"
                        onClick={(e) => handleAssignToGroup(e, group.id)}
                      >
                        <span className="group-menu-icon">{group.icon}</span>
                        <span>{group.name}</span>
                        {session.customGroupId === group.id && <span className="check-mark">✓</span>}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
            <button
              className="session-item-delete"
              onClick={handleDelete}
              title="Delete session"
              aria-label="Delete session"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <polyline points="3 6 5 6 21 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        )
      )}
    </div>
  )
}
