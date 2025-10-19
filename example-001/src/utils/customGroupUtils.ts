import type { CustomGroup, CustomGroupWithSessions, ChatSession } from '../types/session'

const STORAGE_KEY = 'reachat_custom_groups'

// Generate unique ID for groups
export const generateGroupId = (): string => {
  return `group_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
}

// Create a new custom group
export const createCustomGroup = (name: string, color?: string, icon?: string): CustomGroup => {
  return {
    id: generateGroupId(),
    name,
    color: color || '#6366f1',
    icon: icon || '📁',
    createdAt: new Date(),
    order: Date.now(),
  }
}

// Save custom groups to localStorage
export const saveCustomGroups = (groups: CustomGroup[]): void => {
  try {
    const serialized = JSON.stringify(
      groups.map(group => ({
        ...group,
        createdAt: group.createdAt.toISOString(),
      }))
    )
    localStorage.setItem(STORAGE_KEY, serialized)
  } catch (error) {
    console.error('Failed to save custom groups:', error)
  }
}

// Load custom groups from localStorage
export const loadCustomGroups = (): CustomGroup[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return []

    const parsed = JSON.parse(stored)
    return parsed.map((group: any) => ({
      ...group,
      createdAt: new Date(group.createdAt),
    }))
  } catch (error) {
    console.error('Failed to load custom groups:', error)
    return []
  }
}

// Delete a custom group
export const deleteCustomGroup = (groupId: string): void => {
  const groups = loadCustomGroups()
  const filtered = groups.filter(g => g.id !== groupId)
  saveCustomGroups(filtered)
}

// Update a custom group
export const updateCustomGroup = (groupId: string, updates: Partial<CustomGroup>): void => {
  const groups = loadCustomGroups()
  const updated = groups.map(g =>
    g.id === groupId ? { ...g, ...updates } : g
  )
  saveCustomGroups(updated)
}

// Organize sessions by custom groups
export const organizeSessionsByCustomGroups = (
  sessions: ChatSession[],
  customGroups: CustomGroup[]
): {
  customGroupedSessions: CustomGroupWithSessions[]
  ungroupedSessions: ChatSession[]
} => {
  // Sort groups by order
  const sortedGroups = [...customGroups].sort((a, b) => a.order - b.order)

  // Create map of sessions by group ID
  const sessionsByGroupId = new Map<string, ChatSession[]>()
  const ungroupedSessions: ChatSession[] = []

  sessions.forEach(session => {
    if (session.customGroupId) {
      const existing = sessionsByGroupId.get(session.customGroupId) || []
      sessionsByGroupId.set(session.customGroupId, [...existing, session])
    } else {
      ungroupedSessions.push(session)
    }
  })

  // Build custom grouped sessions
  const customGroupedSessions: CustomGroupWithSessions[] = sortedGroups.map(group => ({
    group,
    sessions: sessionsByGroupId.get(group.id) || [],
  }))

  return {
    customGroupedSessions,
    ungroupedSessions,
  }
}

// Reorder groups
export const reorderGroups = (groups: CustomGroup[], fromIndex: number, toIndex: number): CustomGroup[] => {
  const result = Array.from(groups)
  const [removed] = result.splice(fromIndex, 1)
  result.splice(toIndex, 0, removed)

  // Update order values
  return result.map((group, index) => ({
    ...group,
    order: index,
  }))
}

// Available group colors
export const GROUP_COLORS = [
  '#6366f1', // indigo
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#ef4444', // red
  '#f59e0b', // amber
  '#10b981', // emerald
  '#06b6d4', // cyan
  '#3b82f6', // blue
]

// Available group icons
export const GROUP_ICONS = [
  '📁', '🗂️', '📋', '📌', '⭐', '🔖',
  '💼', '🎯', '🏷️', '📦', '🗃️', '🎨'
]
