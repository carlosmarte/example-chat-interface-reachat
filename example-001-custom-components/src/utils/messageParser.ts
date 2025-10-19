import type { Message } from '../components/types'

/**
 * Message Parser
 *
 * Parses plain text messages and converts special syntax into custom components
 */

/**
 * Parse a text message and convert special syntax to custom components
 *
 * Supported syntax:
 * - ```language\ncode\n``` - Code blocks
 * - [action: title | description | variant] - Action cards
 * - [action-preview: title | description | variant] - Action cards in LivePreview
 * - [container: variant | title | content] - Custom containers
 * - [container-preview: variant | title | content] - Containers in LivePreview
 * - [multi-choice: question | type | options | variant] - Multi-choice questions
 */
export function parseMessage(text: string, baseMessage: Partial<Message>): Message[] {
  const messages: Message[] = []
  let currentId = baseMessage.id || Date.now()

  // Extract code blocks (```language\ncode\n```)
  const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g
  let lastIndex = 0
  let match: RegExpExecArray | null

  while ((match = codeBlockRegex.exec(text)) !== null) {
    const beforeText = text.slice(lastIndex, match.index).trim()

    // Add text before code block if exists
    if (beforeText) {
      messages.push({
        ...baseMessage,
        id: currentId++,
        text: beforeText,
        timestamp: new Date()
      } as Message)
    }

    // Add code block component
    const language = match[1] || 'text'
    const code = match[2].trim()

    messages.push({
      ...baseMessage,
      id: currentId++,
      text: match[0], // Keep original markdown syntax for AI context
      timestamp: new Date(),
      componentName: 'CodeBlock',
      componentProps: {
        code,
        language,
        showLineNumbers: true
      }
    } as Message)

    lastIndex = match.index + match[0].length
  }

  // Add remaining text
  const remainingText = text.slice(lastIndex).trim()
  if (remainingText) {
    // Check for other component syntax in remaining text
    const processedMessages = parseComponentSyntax(remainingText, { ...baseMessage, id: currentId })
    messages.push(...processedMessages)
  }

  // If no special syntax found, return original message
  if (messages.length === 0) {
    return [{
      ...baseMessage,
      id: currentId,
      text,
      timestamp: new Date()
    } as Message]
  }

  return messages
}

/**
 * Parse custom component syntax from text
 */
function parseComponentSyntax(text: string, baseMessage: Partial<Message>): Message[] {
  const messages: Message[] = []
  let currentId = baseMessage.id || Date.now()
  let processedText = text
  let match: RegExpExecArray | null

  // Parse [action-preview: ...] syntax - Shows action card in LivePreview with source
  const actionPreviewRegex = /\[action-preview:\s*([^|]+)\s*(?:\|\s*([^|]+)\s*)?(?:\|\s*(\w+)\s*)?\]/g

  while ((match = actionPreviewRegex.exec(text)) !== null) {
    const title = match[1].trim()
    const description = match[2]?.trim() || ''
    const variant = match[3]?.trim() || 'default'

    const html = generateActionCardHTML(title, description, variant)

    messages.push({
      ...baseMessage,
      id: currentId++,
      text: match[0], // Keep original syntax for AI context
      timestamp: new Date(),
      componentName: 'LivePreview',
      componentProps: {
        html,
        title: `Action Card - ${variant}`,
        defaultTab: 'preview',
        height: 200,
        language: 'html'
      }
    } as Message)

    processedText = processedText.replace(match[0], '')
  }

  // Parse [action: ...] syntax with extended metadata (icon, button text)
  // Format: [action: title | description | variant | icon:emoji | button:text]
  const actionRegex = /\[action:\s*([^|\]]+)(?:\s*\|\s*([^|\]]+))?(?:\s*\|\s*([^|\]]+))?(?:\s*\|\s*([^|\]]+))?(?:\s*\|\s*([^|\]]+))?\]/g

  while ((match = actionRegex.exec(text)) !== null) {
    const title = match[1].trim()
    const description = match[2]?.trim()
    const variant = match[3]?.trim() || 'default'
    const iconMeta = match[4]?.trim()
    const buttonMeta = match[5]?.trim()

    // Extract icon if present (format: icon:emoji)
    let icon: string | undefined
    if (iconMeta?.startsWith('icon:')) {
      icon = iconMeta.substring(5)
    }

    // Extract button text if present (format: button:text)
    let buttonText = 'Action'
    if (buttonMeta?.startsWith('button:')) {
      buttonText = buttonMeta.substring(7)
    }

    // Create action handler that shows alert with emoji
    const variantEmojis: Record<string, string> = {
      default: 'ℹ️',
      primary: '🔵',
      success: '✅',
      warning: '⚠️',
      danger: '❌'
    }
    const emoji = variantEmojis[variant] || '📌'
    const onAction = () => {
      alert(`${emoji} Action: ${title}\n\n[This is a mock action - no actual operation was performed]`)
    }

    messages.push({
      ...baseMessage,
      id: currentId++,
      text: match[0], // Keep original syntax for AI context
      timestamp: new Date(),
      componentName: 'ActionCard',
      componentProps: {
        title,
        description,
        variant,
        icon,
        buttonText,
        onAction
      }
    } as Message)

    processedText = processedText.replace(match[0], '')
  }

  // Parse [container-preview: ...] syntax - Shows container in LivePreview with source
  const containerPreviewRegex = /\[container-preview:\s*(\w+)\s*(?:\|\s*([^|]+)\s*)?(?:\|\s*([^|\]]+)\s*)?\]/g

  while ((match = containerPreviewRegex.exec(text)) !== null) {
    const variant = match[1].trim()
    const title = match[2]?.trim() || ''
    const content = match[3]?.trim() || ''

    const html = generateContainerHTML(variant, title, content)

    messages.push({
      ...baseMessage,
      id: currentId++,
      text: match[0], // Keep original syntax for AI context
      timestamp: new Date(),
      componentName: 'LivePreview',
      componentProps: {
        html,
        title: `Container - ${variant}`,
        defaultTab: 'preview',
        height: 150,
        language: 'html'
      }
    } as Message)

    processedText = processedText.replace(match[0], '')
  }

  // Parse [container: ...] syntax
  const containerRegex = /\[container:\s*(\w+)\s*(?:\|\s*([^|]+)\s*)?(?:\|\s*([^|\]]+)\s*)?\]/g

  while ((match = containerRegex.exec(text)) !== null) {
    const variant = match[1].trim()
    const title = match[2]?.trim()
    const content = match[3]?.trim() || ''

    messages.push({
      ...baseMessage,
      id: currentId++,
      text: match[0], // Keep original syntax for AI context
      timestamp: new Date(),
      componentName: 'CustomContainer',
      componentProps: {
        variant,
        title,
        children: content
      }
    } as Message)

    processedText = processedText.replace(match[0], '')
  }

  // Parse [multi-choice: ...] syntax
  // Format: [multi-choice: question | type | option1:desc1, option2:desc2, ... | variant]
  const multiChoiceRegex = /\[multi-choice:\s*([^|]+)\s*(?:\|\s*([^|]+)\s*)?(?:\|\s*([^|]+)\s*)?(?:\|\s*(\w+)\s*)?\]/g

  while ((match = multiChoiceRegex.exec(text)) !== null) {
    const question = match[1].trim()
    const type = match[2]?.trim() || 'single'
    const optionsStr = match[3]?.trim() || ''
    const variant = match[4]?.trim() || 'default'

    // Parse options (format: "label:description" or just "label")
    const options = optionsStr.split(',').map((opt, index) => {
      const parts = opt.trim().split(':')
      return {
        id: `option-${index}`,
        label: parts[0].trim(),
        description: parts[1]?.trim()
      }
    }).filter(opt => opt.label.length > 0)

    // Create submit handler
    const onSubmit = (selected: string[]) => {
      const selectedLabels = selected
        .map(id => {
          const optIndex = parseInt(id.split('-')[1])
          return options[optIndex]?.label
        })
        .filter(Boolean)

      alert(`✅ Selection${selectedLabels.length > 1 ? 's' : ''}: ${selectedLabels.join(', ')}\n\n[This is a mock submission - no data was saved]`)
    }

    messages.push({
      ...baseMessage,
      id: currentId++,
      text: match[0], // Keep original syntax for AI context
      timestamp: new Date(),
      componentName: 'MultiChoice',
      componentProps: {
        question,
        options,
        type,
        variant,
        onSubmit
      }
    } as Message)

    processedText = processedText.replace(match[0], '')
  }

  // If there's remaining text after parsing components, add it as a regular message
  const remainingText = processedText.trim()
  if (remainingText && messages.length > 0) {
    messages.unshift({
      ...baseMessage,
      id: (baseMessage.id || Date.now()) - 1,
      text: remainingText,
      timestamp: new Date()
    } as Message)
  } else if (messages.length === 0) {
    // No components found, return as regular text
    messages.push({
      ...baseMessage,
      id: currentId,
      text,
      timestamp: new Date()
    } as Message)
  }

  return messages
}

/**
 * Check if a message contains parseable syntax
 */
export function hasParseableSyntax(text: string): boolean {
  const patterns = [
    /```\w*\n[\s\S]*?```/,                  // Code blocks
    /\[action:\s*[^\]]+\]/,                 // Action cards
    /\[action-preview:\s*[^\]]+\]/,         // Action cards with preview
    /\[container:\s*[^\]]+\]/,              // Containers
    /\[container-preview:\s*[^\]]+\]/,      // Containers with preview
    /\[multi-choice:\s*[^\]]+\]/,           // Multi-choice questions
  ]

  return patterns.some(pattern => pattern.test(text))
}

/**
 * Generate HTML for ActionCard component
 */
function generateActionCardHTML(title: string, description: string, variant: string): string {
  const variantColors: Record<string, { bg: string; border: string; button: string; buttonHover: string }> = {
    default: {
      bg: '#f8fafc',
      border: '#cbd5e1',
      button: '#3b82f6',
      buttonHover: '#2563eb'
    },
    primary: {
      bg: '#eff6ff',
      border: '#93c5fd',
      button: '#3b82f6',
      buttonHover: '#2563eb'
    },
    success: {
      bg: '#f0fdf4',
      border: '#86efac',
      button: '#10b981',
      buttonHover: '#059669'
    },
    warning: {
      bg: '#fffbeb',
      border: '#fcd34d',
      button: '#f59e0b',
      buttonHover: '#d97706'
    },
    danger: {
      bg: '#fef2f2',
      border: '#fca5a5',
      button: '#ef4444',
      buttonHover: '#dc2626'
    }
  }

  const colors = variantColors[variant] || variantColors.default

  return `<div style="background: ${colors.bg}; border: 2px solid ${colors.border}; border-radius: 12px; padding: 20px; max-width: 400px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">
  <h3 style="margin: 0 0 8px 0; font-size: 18px; font-weight: 600; color: #1f2937;">${title}</h3>
  ${description ? `<p style="margin: 0 0 16px 0; font-size: 14px; color: #6b7280; line-height: 1.5;">${description}</p>` : ''}
  <button style="padding: 10px 20px; background: ${colors.button}; color: white; border: none; border-radius: 6px; font-size: 14px; font-weight: 600; cursor: pointer; transition: background 0.2s;" onmouseover="this.style.background='${colors.buttonHover}'" onmouseout="this.style.background='${colors.button}'">
    Action
  </button>
</div>`
}

/**
 * Generate HTML for CustomContainer component
 */
function generateContainerHTML(variant: string, title: string, content: string): string {
  const variantStyles: Record<string, { bg: string; border: string; icon: string; titleColor: string }> = {
    info: {
      bg: '#eff6ff',
      border: '#3b82f6',
      icon: 'ℹ️',
      titleColor: '#1e40af'
    },
    success: {
      bg: '#f0fdf4',
      border: '#10b981',
      icon: '✅',
      titleColor: '#065f46'
    },
    warning: {
      bg: '#fffbeb',
      border: '#f59e0b',
      icon: '⚠️',
      titleColor: '#92400e'
    },
    error: {
      bg: '#fef2f2',
      border: '#ef4444',
      icon: '❌',
      titleColor: '#991b1b'
    },
    neutral: {
      bg: '#f8fafc',
      border: '#94a3b8',
      icon: '📝',
      titleColor: '#334155'
    }
  }

  const styles = variantStyles[variant] || variantStyles.neutral

  return `<div style="background: ${styles.bg}; border-left: 4px solid ${styles.border}; border-radius: 6px; padding: 16px; max-width: 500px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">
  ${title ? `<div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
    <span style="font-size: 18px;">${styles.icon}</span>
    <h4 style="margin: 0; font-size: 16px; font-weight: 600; color: ${styles.titleColor};">${title}</h4>
  </div>` : ''}
  <p style="margin: 0; font-size: 14px; color: #374151; line-height: 1.5;">${content}</p>
</div>`
}

/**
 * Parse table syntax from markdown-style tables
 * Example:
 * | Name | Age |
 * |------|-----|
 * | John | 30  |
 */
export function parseTableSyntax(text: string): { columns: any[], data: any[] } | null {
  const lines = text.trim().split('\n')

  if (lines.length < 3) return null

  // Parse header
  const headerLine = lines[0].trim()
  if (!headerLine.startsWith('|') || !headerLine.endsWith('|')) return null

  const headers = headerLine
    .split('|')
    .map(h => h.trim())
    .filter(h => h.length > 0)

  // Skip separator line (line 1)
  const separatorLine = lines[1].trim()
  if (!separatorLine.includes('---')) return null

  // Parse data rows
  const data = []
  for (let i = 2; i < lines.length; i++) {
    const line = lines[i].trim()
    if (!line.startsWith('|') || !line.endsWith('|')) continue

    const values = line
      .split('|')
      .map(v => v.trim())
      .filter(v => v.length > 0)

    if (values.length === headers.length) {
      const row: any = {}
      headers.forEach((header, index) => {
        const key = header.toLowerCase().replace(/\s+/g, '_')
        row[key] = values[index]
      })
      data.push(row)
    }
  }

  // Create columns
  const columns = headers.map(header => ({
    key: header.toLowerCase().replace(/\s+/g, '_'),
    label: header
  }))

  return { columns, data }
}

/**
 * Extract and parse code blocks from markdown-style text
 */
export function extractCodeBlocks(text: string): Array<{ language: string; code: string; index: number }> {
  const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g
  const blocks: Array<{ language: string; code: string; index: number }> = []
  let match: RegExpExecArray | null

  while ((match = codeBlockRegex.exec(text)) !== null) {
    blocks.push({
      language: match[1] || 'text',
      code: match[2].trim(),
      index: match.index
    })
  }

  return blocks
}
