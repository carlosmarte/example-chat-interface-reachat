import { useState } from 'react'
import './MultiChoice.css'

export interface MultiChoiceOption {
  id: string
  label: string
  description?: string
}

export interface MultiChoiceProps {
  question: string
  options: MultiChoiceOption[]
  type?: 'single' | 'multiple'
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'info'
  onSubmit?: (selected: string[]) => void
  submitText?: string
}

export function MultiChoice({
  question,
  options,
  type = 'single',
  variant = 'default',
  onSubmit,
  submitText = 'Submit'
}: MultiChoiceProps) {
  const [selected, setSelected] = useState<string[]>([])

  const handleOptionClick = (optionId: string) => {
    if (type === 'single') {
      setSelected([optionId])
    } else {
      setSelected(prev =>
        prev.includes(optionId)
          ? prev.filter(id => id !== optionId)
          : [...prev, optionId]
      )
    }
  }

  const handleSubmit = () => {
    if (onSubmit && selected.length > 0) {
      onSubmit(selected)
    }
  }

  return (
    <div className={`multi-choice multi-choice--${variant}`}>
      <div className="multi-choice-question">
        <h4>{question}</h4>
        <span className="multi-choice-type">
          {type === 'single' ? 'Choose one' : 'Choose all that apply'}
        </span>
      </div>

      <div className="multi-choice-options">
        {options.map((option) => {
          const isSelected = selected.includes(option.id)
          return (
            <div
              key={option.id}
              className={`multi-choice-option ${isSelected ? 'multi-choice-option--selected' : ''}`}
              onClick={() => handleOptionClick(option.id)}
            >
              <div className="multi-choice-option-indicator">
                {type === 'single' ? (
                  <div className={`radio-indicator ${isSelected ? 'radio-indicator--selected' : ''}`}>
                    {isSelected && <div className="radio-dot" />}
                  </div>
                ) : (
                  <div className={`checkbox-indicator ${isSelected ? 'checkbox-indicator--selected' : ''}`}>
                    {isSelected && <span className="checkbox-check">✓</span>}
                  </div>
                )}
              </div>
              <div className="multi-choice-option-content">
                <div className="multi-choice-option-label">{option.label}</div>
                {option.description && (
                  <div className="multi-choice-option-description">{option.description}</div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {onSubmit && (
        <button
          className={`multi-choice-submit multi-choice-submit--${variant}`}
          onClick={handleSubmit}
          disabled={selected.length === 0}
        >
          {submitText}
          {selected.length > 0 && ` (${selected.length})`}
        </button>
      )}
    </div>
  )
}
