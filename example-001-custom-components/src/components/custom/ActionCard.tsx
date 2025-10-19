import './ActionCard.css'

export interface ActionCardProps {
  title: string
  description?: string
  icon?: string
  buttonText?: string
  onAction?: () => void
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger'
  disabled?: boolean
}

export function ActionCard({
  title,
  description,
  icon,
  buttonText = 'Action',
  onAction,
  variant = 'default',
  disabled = false
}: ActionCardProps) {
  return (
    <div className={`custom-action-card custom-action-card--${variant}`}>
      <div className="custom-action-card-content">
        {icon && (
          <div className="custom-action-card-icon">
            {icon}
          </div>
        )}
        <div className="custom-action-card-text">
          <h4 className="custom-action-card-title">{title}</h4>
          {description && (
            <p className="custom-action-card-description">{description}</p>
          )}
        </div>
      </div>
      {onAction && (
        <button
          className={`custom-action-card-button custom-action-card-button--${variant}`}
          onClick={onAction}
          disabled={disabled}
        >
          {buttonText}
        </button>
      )}
    </div>
  )
}
