import { streamChat } from '@/core/ai/client'
import { loadApiKey } from '@/core/crypto/vault'
import { nanoid } from 'nanoid'
import type { ToolDefinition } from '@/types'

export async function analyzeImage(imageBase64: string, query: string, apiKey?: string, model = 'openai/gpt-4o'): Promise<string | null> {
  const key = apiKey || (await loadApiKey('openai'))
  if (!key) {
    return 'OpenAI API key not configured'
  }

  const messages = [
    {
      role: 'user',
      content: [
        { type: 'text', text: query },
        { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${imageBase64}` } },
      ],
    },
  ] as Array<{ role: 'user'; content: Array<{ type: 'text'; text: string } | { type: 'image_url'; image_url: { url: string } }> }>

  return new Promise((resolve) => {
    let content = ''
    let hasResult = false

    streamChat(
      {
        model,
        messages,
        onChunk: (chunk) => {
          content += chunk
        },
        onDone: () => {
          if (!hasResult) {
            hasResult = true
            resolve(content)
          }
        },
        onError: (error) => {
          if (!hasResult) {
            hasResult = true
            resolve(`Error analyzing image: ${error.message}`)
          }
        },
      },
      key,
    )
  })
}

export const imageAnalyzerTool: ToolDefinition = {
  name: 'image_analyzer',
  description: 'Analyze an image using vision models. Provide base64 image data and a query.',
  parameters: {
    imageBase64: { type: 'string', description: 'Base64 encoded image data' },
    query: { type: 'string', description: 'Question or instruction about the image' },
    model: { type: 'string', description: 'Model to use (default: openai/gpt-4o)' },
  },
  execute: async (args) => {
    const { imageBase64, query, model = 'openai/gpt-4o' } = args
    return analyzeImage(imageBase64 as string, query as string, undefined, model as string)
  },
}