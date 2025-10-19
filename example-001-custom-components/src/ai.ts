import { createProvider } from './providers/factory'
import type { ProviderType } from './providers/factory'
import type { LLMProvider } from './providers/types'

export type Message = {
  role: 'assistant' | 'user'
  content: string
}

// Get environment configuration
const AI_PROVIDER = (import.meta.env.VITE_AI_PROVIDER || 'openai') as ProviderType
const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY
const OPENAI_MODEL = import.meta.env.VITE_OPENAI_MODEL || 'gpt-4o'
const ANTHROPIC_API_KEY = import.meta.env.VITE_ANTHROPIC_API_KEY
const ANTHROPIC_MODEL =
  import.meta.env.VITE_ANTHROPIC_MODEL || 'claude-3-5-sonnet-20241022'

// Initialize provider
let provider: LLMProvider | null = null

try {
  if (AI_PROVIDER === 'openai' && OPENAI_API_KEY) {
    provider = createProvider({
      provider: 'openai',
      apiKey: OPENAI_API_KEY,
      model: OPENAI_MODEL,
    })
  } else if (AI_PROVIDER === 'anthropic' && ANTHROPIC_API_KEY) {
    provider = createProvider({
      provider: 'anthropic',
      apiKey: ANTHROPIC_API_KEY,
      model: ANTHROPIC_MODEL,
    })
  }
} catch (error) {
  console.error('Failed to initialize AI provider:', error)
}

/**
 * Send a message to the configured AI provider
 */
export async function sendMessage(
  messages: Message[],
  onChunk: (text: string) => void
): Promise<void> {
  if (!provider) {
    throw new Error('AI provider not initialized. Check your API key configuration.')
  }

  return provider.sendMessage(messages, onChunk)
}

/**
 * Check if AI is configured
 */
export function isAIConfigured(): boolean {
  return provider !== null
}

/**
 * Get the current AI provider name
 */
export function getAIProvider(): string {
  return AI_PROVIDER
}
