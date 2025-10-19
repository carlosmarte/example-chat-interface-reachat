import { useState } from 'react'
import './CodeBlock.css'

export interface CodeBlockProps {
  code: string
  language?: string
  showLineNumbers?: boolean
  title?: string
}

export function CodeBlock({
  code,
  language = 'javascript',
  showLineNumbers = true,
  title
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy code:', err)
    }
  }

  const lines = code.split('\n')

  return (
    <div className="custom-code-block">
      <div className="custom-code-block-header">
        <div className="custom-code-block-info">
          <span className="custom-code-block-language">{language}</span>
          {title && <span className="custom-code-block-title">{title}</span>}
        </div>
        <button
          className="custom-code-block-copy"
          onClick={handleCopy}
          title="Copy code"
        >
          {copied ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <polyline points="20 6 9 17 4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <rect x="9" y="9" width="13" height="13" rx="2" stroke="currentColor" strokeWidth="2" />
              <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" stroke="currentColor" strokeWidth="2" />
            </svg>
          )}
          <span>{copied ? 'Copied!' : 'Copy'}</span>
        </button>
      </div>
      <div className="custom-code-block-content">
        <pre>
          <code>
            {showLineNumbers ? (
              <table className="custom-code-block-table">
                <tbody>
                  {lines.map((line, index) => (
                    <tr key={index}>
                      <td className="custom-code-block-line-number">{index + 1}</td>
                      <td className="custom-code-block-line-content">{line || '\n'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              code
            )}
          </code>
        </pre>
      </div>
    </div>
  )
}
