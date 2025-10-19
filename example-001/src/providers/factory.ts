import type { LLMProvider } from './types'
import { OpenAIProvider } from './openai'
import { AnthropicProvider } from './anthropic'

export type ProviderType = 'openai' | 'anthropic'

export interface CreateProviderOptions {
  provider: ProviderType
  apiKey: string
  model: string
}

/**
 * Factory function to create an LLM provider instance
 */
export function createProvider(options: CreateProviderOptions): LLMProvider {
  switch (options.provider) {
    case 'openai':
      return new OpenAIProvider({
        apiKey: options.apiKey,
        model: options.model,
      })
    case 'anthropic':
      return new AnthropicProvider({
        apiKey: options.apiKey,
        model: options.model,
      })
    default:
      throw new Error(`Unsupported provider: ${options.provider}`)
  }
}
