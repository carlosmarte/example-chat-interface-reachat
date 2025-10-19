import { useState } from 'react'
import type { ReactNode } from 'react'
import './CustomContainer.css'

export interface CustomContainerProps {
  children: ReactNode
  variant?: 'info' | 'success' | 'warning' | 'error' | 'neutral'
  title?: string
  icon?: string
  collapsible?: boolean
  defaultCollapsed?: boolean
}

export function CustomContainer({
  children,
  variant = 'neutral',
  title,
  icon,
  collapsible = false,
  defaultCollapsed = false
}: CustomContainerProps) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed)

  return (
    <div className={`custom-container custom-container--${variant}`}>
      {(title || icon) && (
        <div className="custom-container-header">
          <div className="custom-container-header-content">
            {icon && <span className="custom-container-icon">{icon}</span>}
            {title && <h4 className="custom-container-title">{title}</h4>}
          </div>
          {collapsible && (
            <button
              className="custom-container-toggle"
              onClick={() => setCollapsed(!collapsed)}
              aria-label={collapsed ? 'Expand' : 'Collapse'}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                style={{
                  transform: collapsed ? 'rotate(-90deg)' : 'rotate(0deg)',
                  transition: 'transform 0.2s'
                }}
              >
                <polyline points="6 9 12 15 18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          )}
        </div>
      )}
      {!collapsed && (
        <div className="custom-container-body">
          {children}
        </div>
      )}
    </div>
  )
}
