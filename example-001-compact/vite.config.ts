import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  loadEnv(mode, process.cwd(), '')

  return {
    plugins: [
      react({
        babel: {
          plugins: [['babel-plugin-react-compiler']],
        },
      }),
    ],
    // Expose specific env variables to the client
    define: {
      'import.meta.env.VITE_AI_PROVIDER': JSON.stringify(
        process.env.VITE_AI_PROVIDER || 'openai'
      ),
      'import.meta.env.VITE_OPENAI_API_KEY': JSON.stringify(
         process.env.VITE_OPENAI_API_KEY || process.env.OPENAI_API_KEY || ''
      ),
      'import.meta.env.VITE_OPENAI_MODEL': JSON.stringify(
         process.env.VITE_OPENAI_MODEL || 'gpt-4o'
      ),
      'import.meta.env.VITE_ANTHROPIC_API_KEY': JSON.stringify(
         process.env.VITE_ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY || ''
      ),
      'import.meta.env.VITE_ANTHROPIC_MODEL': JSON.stringify(
         process.env.VITE_ANTHROPIC_MODEL || 'claude-3-5-sonnet-20241022'
      ),
    },
  }
})
