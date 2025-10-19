import { useState } from 'react'
import './RadioGroup.css'

export interface RadioOption {
  value: string
  label: string
  description?: string
}

export interface RadioGroupProps {
  title?: string
  options: RadioOption[]
  defaultValue?: string
  onSelect?: (value: string) => void
  variant?: 'default' | 'cards'
}

export function RadioGroup({
  title,
  options,
  defaultValue,
  onSelect,
  variant = 'default'
}: RadioGroupProps) {
  const [selected, setSelected] = useState(defaultValue || options[0]?.value)

  const handleSelect = (value: string) => {
    setSelected(value)
    onSelect?.(value)
    console.log('Selected:', value)
  }

  return (
    <div className="custom-radio-group">
      {title && <h4 className="custom-radio-group-title">{title}</h4>}
      <div className={`custom-radio-options custom-radio-options--${variant}`}>
        {options.map((option) => (
          <label
            key={option.value}
            className={`custom-radio-option ${
              selected === option.value ? 'custom-radio-option--selected' : ''
            }`}
          >
            <input
              type="radio"
              name="radio-group"
              value={option.value}
              checked={selected === option.value}
              onChange={() => handleSelect(option.value)}
              className="custom-radio-input"
            />
            <div className="custom-radio-content">
              <span className="custom-radio-indicator">
                {selected === option.value && (
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <circle cx="6" cy="6" r="3" fill="currentColor" />
                  </svg>
                )}
              </span>
              <div className="custom-radio-text">
                <span className="custom-radio-label">{option.label}</span>
                {option.description && (
                  <span className="custom-radio-description">{option.description}</span>
                )}
              </div>
            </div>
          </label>
        ))}
      </div>
    </div>
  )
}
