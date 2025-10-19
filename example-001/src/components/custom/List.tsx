import './List.css'

export interface ListItem {
  id?: string | number
  text: string
  icon?: string
  badge?: string
  checked?: boolean
  variant?: 'default' | 'success' | 'warning' | 'error'
}

export interface ListProps {
  title?: string
  items: ListItem[]
  variant?: 'default' | 'ordered' | 'checklist' | 'icons'
  compact?: boolean
  onItemClick?: (item: ListItem, index: number) => void
}

export function List({
  title,
  items,
  variant = 'default',
  compact = false,
  onItemClick
}: ListProps) {
  const isOrdered = variant === 'ordered'
  const isChecklist = variant === 'checklist'
  const hasIcons = variant === 'icons'

  return (
    <div className="custom-list">
      {title && <h4 className="custom-list-title">{title}</h4>}
      <ul className={`custom-list-items custom-list-items--${variant} ${compact ? 'custom-list-items--compact' : ''}`}>
        {items.map((item, index) => (
          <li
            key={item.id || index}
            className={`custom-list-item ${item.variant ? `custom-list-item--${item.variant}` : ''} ${onItemClick ? 'custom-list-item--clickable' : ''}`}
            onClick={() => onItemClick?.(item, index)}
          >
            {isOrdered && (
              <span className="custom-list-number">{index + 1}.</span>
            )}

            {isChecklist && (
              <span className={`custom-list-checkbox ${item.checked ? 'custom-list-checkbox--checked' : ''}`}>
                {item.checked ? (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <polyline points="20 6 9 17 4 12" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : null}
              </span>
            )}

            {hasIcons && item.icon && (
              <span className="custom-list-icon">{item.icon}</span>
            )}

            <span className={`custom-list-text ${item.checked ? 'custom-list-text--checked' : ''}`}>
              {item.text}
            </span>

            {item.badge && (
              <span className="custom-list-badge">{item.badge}</span>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}
