import { useState } from 'react'
import './LivePreview.css'

export interface LivePreviewProps {
  html: string
  title?: string
  defaultTab?: 'preview' | 'code'
  height?: number
  language?: 'html' | 'jsx' | 'tsx'
  showCopy?: boolean
}

export function LivePreview({
  html,
  title,
  defaultTab = 'preview',
  height = 300,
  language = 'html',
  showCopy = true
}: LivePreviewProps) {
  const [activeTab, setActiveTab] = useState<'preview' | 'code'>(defaultTab)
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(html)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  return (
    <div className="live-preview">
      {/* Header with tabs */}
      <div className="live-preview-header">
        <div className="live-preview-tabs">
          <button
            className={`live-preview-tab ${activeTab === 'preview' ? 'active' : ''}`}
            onClick={() => setActiveTab('preview')}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2" />
              <path d="M9 9h6M9 12h6M9 15h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            Preview
          </button>
          <button
            className={`live-preview-tab ${activeTab === 'code' ? 'active' : ''}`}
            onClick={() => setActiveTab('code')}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <polyline points="16 18 22 12 16 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <polyline points="8 6 2 12 8 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Code
          </button>
        </div>

        <div className="live-preview-title-section">
          {title && <span className="live-preview-title">{title}</span>}
          {showCopy && activeTab === 'code' && (
            <button
              className="live-preview-copy-btn"
              onClick={handleCopy}
              title="Copy code"
            >
              {copied ? (
                <>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                    <polyline points="20 6 9 17 4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Copied!
                </>
              ) : (
                <>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                    <rect x="9" y="9" width="13" height="13" rx="2" stroke="currentColor" strokeWidth="2" />
                    <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" stroke="currentColor" strokeWidth="2" />
                  </svg>
                  Copy
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Content area */}
      <div className="live-preview-content" style={{ height: `${height}px` }}>
        {activeTab === 'preview' ? (
          <div className="live-preview-iframe-container">
            <iframe
              srcDoc={html}
              className="live-preview-iframe"
              sandbox="allow-scripts"
              title="Preview"
            />
          </div>
        ) : (
          <div className="live-preview-code">
            <pre>
              <code className={`language-${language}`}>{html}</code>
            </pre>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="live-preview-footer">
        <span className="live-preview-language">{language.toUpperCase()}</span>
        <span className="live-preview-info">
          {activeTab === 'preview' ? '🎨 Live Preview' : '📝 Source Code'}
        </span>
      </div>
    </div>
  )
}
