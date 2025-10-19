import { useState } from 'react'
import type { CustomGroup } from '../types/session'
import { GROUP_COLORS, GROUP_ICONS } from '../utils/customGroupUtils'
import './CustomGroupManager.css'

interface CustomGroupManagerProps {
  groups: CustomGroup[]
  onCreateGroup: (name: string, color: string, icon: string) => void
  onUpdateGroup: (groupId: string, updates: Partial<CustomGroup>) => void
  onDeleteGroup: (groupId: string) => void
  onClose: () => void
}

export function CustomGroupManager({
  groups,
  onCreateGroup,
  onUpdateGroup,
  onDeleteGroup,
  onClose,
}: CustomGroupManagerProps) {
  const [isCreating, setIsCreating] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [newGroupName, setNewGroupName] = useState('')
  const [selectedColor, setSelectedColor] = useState(GROUP_COLORS[0])
  const [selectedIcon, setSelectedIcon] = useState(GROUP_ICONS[0])

  const handleCreate = () => {
    if (newGroupName.trim()) {
      onCreateGroup(newGroupName.trim(), selectedColor, selectedIcon)
      setNewGroupName('')
      setSelectedColor(GROUP_COLORS[0])
      setSelectedIcon(GROUP_ICONS[0])
      setIsCreating(false)
    }
  }

  const handleUpdate = (group: CustomGroup) => {
    if (newGroupName.trim()) {
      onUpdateGroup(group.id, {
        name: newGroupName.trim(),
        color: selectedColor,
        icon: selectedIcon,
      })
      setEditingId(null)
      setNewGroupName('')
    }
  }

  const startEdit = (group: CustomGroup) => {
    setEditingId(group.id)
    setNewGroupName(group.name)
    setSelectedColor(group.color || GROUP_COLORS[0])
    setSelectedIcon(group.icon || GROUP_ICONS[0])
  }

  const cancelEdit = () => {
    setEditingId(null)
    setIsCreating(false)
    setNewGroupName('')
    setSelectedColor(GROUP_COLORS[0])
    setSelectedIcon(GROUP_ICONS[0])
  }

  return (
    <div className="custom-group-manager">
      <div className="custom-group-manager-header">
        <h3>Manage Groups</h3>
        <button className="close-btn" onClick={onClose} aria-label="Close">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      <div className="custom-group-manager-content">
        <div className="custom-group-list">
          {groups.map(group => (
            <div key={group.id} className="custom-group-item">
              {editingId === group.id ? (
                <div className="custom-group-edit-form">
                  <div className="group-input-row">
                    <input
                      type="text"
                      value={newGroupName}
                      onChange={(e) => setNewGroupName(e.target.value)}
                      placeholder="Group name"
                      className="group-name-input"
                      autoFocus
                    />
                  </div>
                  <div className="group-customization">
                    <div className="color-picker">
                      {GROUP_COLORS.map(color => (
                        <button
                          key={color}
                          className={`color-option ${selectedColor === color ? 'active' : ''}`}
                          style={{ backgroundColor: color }}
                          onClick={() => setSelectedColor(color)}
                          aria-label={`Select color ${color}`}
                        />
                      ))}
                    </div>
                    <div className="icon-picker">
                      {GROUP_ICONS.map(icon => (
                        <button
                          key={icon}
                          className={`icon-option ${selectedIcon === icon ? 'active' : ''}`}
                          onClick={() => setSelectedIcon(icon)}
                          aria-label={`Select icon ${icon}`}
                        >
                          {icon}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="group-form-actions">
                    <button className="btn-secondary" onClick={cancelEdit}>
                      Cancel
                    </button>
                    <button className="btn-primary" onClick={() => handleUpdate(group)}>
                      Save
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="custom-group-info">
                    <span className="group-icon">{group.icon}</span>
                    <span className="group-name">{group.name}</span>
                    <div className="group-color-indicator" style={{ backgroundColor: group.color }} />
                  </div>
                  <div className="custom-group-actions">
                    <button
                      className="icon-btn"
                      onClick={() => startEdit(group)}
                      title="Edit group"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                        <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>
                    <button
                      className="icon-btn danger"
                      onClick={() => onDeleteGroup(group.id)}
                      title="Delete group"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                        <polyline points="3 6 5 6 21 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>

        {isCreating ? (
          <div className="custom-group-create-form">
            <div className="group-input-row">
              <input
                type="text"
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                placeholder="Group name"
                className="group-name-input"
                autoFocus
              />
            </div>
            <div className="group-customization">
              <div className="color-picker">
                <label>Color:</label>
                {GROUP_COLORS.map(color => (
                  <button
                    key={color}
                    className={`color-option ${selectedColor === color ? 'active' : ''}`}
                    style={{ backgroundColor: color }}
                    onClick={() => setSelectedColor(color)}
                    aria-label={`Select color ${color}`}
                  />
                ))}
              </div>
              <div className="icon-picker">
                <label>Icon:</label>
                {GROUP_ICONS.map(icon => (
                  <button
                    key={icon}
                    className={`icon-option ${selectedIcon === icon ? 'active' : ''}`}
                    onClick={() => setSelectedIcon(icon)}
                    aria-label={`Select icon ${icon}`}
                  >
                    {icon}
                  </button>
                ))}
              </div>
            </div>
            <div className="group-form-actions">
              <button className="btn-secondary" onClick={cancelEdit}>
                Cancel
              </button>
              <button className="btn-primary" onClick={handleCreate}>
                Create
              </button>
            </div>
          </div>
        ) : (
          <button
            className="create-group-btn"
            onClick={() => setIsCreating(true)}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <line x1="12" y1="5" x2="12" y2="19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <line x1="5" y1="12" x2="19" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            Create New Group
          </button>
        )}
      </div>
    </div>
  )
}
