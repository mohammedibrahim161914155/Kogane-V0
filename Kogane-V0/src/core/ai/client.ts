import { OPENROUTER_BASE } from '@/lib/constants'
import type { ChatMessage, ToolDefinition } from '@/types'

export interface StreamOptions {
  model: string
  messages: ChatMessage[]
  temperature?: number
  maxTokens?: number
  tools?: ToolDefinition[]
  signal?: AbortSignal
  onChunk: (text: string) => void
  onToolCall?: (call: { id: string; name: string; arguments: string }) => void
  onDone: (usage: { prompt_tokens: number; completion_tokens: number }) => void
  onError: (err: Error) => void
}

export async function streamChat(opts: StreamOptions, apiKey: string): Promise<void> {
  const toolDefs = opts.tools?.map((t) => ({
    type: 'function' as const,
    function: {
      name: t.name,
      description: t.description,
      parameters: {
        type: 'object',
        properties: t.parameters,
        required: Object.keys(t.parameters),
      },
    },
  }))

  const body: Record<string, unknown> = {
    model: opts.model,
    messages: opts.messages,
    stream: true,
    temperature: opts.temperature ?? 0.7,
    max_tokens: opts.maxTokens ?? 4096,
  }
  if (toolDefs && toolDefs.length > 0) body.tools = toolDefs

  let response: Response
  try {
    response = await fetch(`${OPENROUTER_BASE}/chat/completions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://kogane.app',
        'X-Title': 'Kogane AI',
      },
      body: JSON.stringify(body),
      signal: opts.signal,
    })
  } catch (err) {
    if ((err as Error).name === 'AbortError') return
    opts.onError(err as Error)
    return
  }

  if (!response.ok) {
    const text = await response.text()
    opts.onError(new Error(`OpenRouter error ${response.status}: ${text}`))
    return
  }

  const reader = response.body?.getReader()
  if (!reader) {
    opts.onError(new Error('No response body'))
    return
  }

  const decoder = new TextDecoder()
  let buffer = ''

  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() ?? ''

      for (const line of lines) {
        const trimmed = line.trim()
        if (!trimmed || !trimmed.startsWith('data: ')) continue

        const data = trimmed.slice(6)
        if (data === '[DONE]') {
          opts.onDone({ prompt_tokens: 0, completion_tokens: 0 })
          return
        }

        try {
          const parsed = JSON.parse(data) as {
            choices?: Array<{
              delta?: {
                content?: string
                tool_calls?: Array<{ id: string; function: { name: string; arguments: string } }>
              }
            }>
            usage?: { prompt_tokens: number; completion_tokens: number }
            error?: { message: string }
          }

          if (parsed.error) {
            opts.onError(new Error(parsed.error.message))
            return
          }

          const delta = parsed.choices?.[0]?.delta
          if (delta?.content) {
            opts.onChunk(delta.content)
          }
          if (delta?.tool_calls && opts.onToolCall) {
            for (const tc of delta.tool_calls) {
              opts.onToolCall({ id: tc.id, name: tc.function.name, arguments: tc.function.arguments })
            }
          }
          if (parsed.usage) {
            opts.onDone(parsed.usage)
            return
          }
        } catch {
          // ignore parse errors for partial chunks
        }
      }
    }
  } catch (err) {
    if ((err as Error).name === 'AbortError') return
    opts.onError(err as Error)
  } finally {
    reader.releaseLock()
  }

  opts.onDone({ prompt_tokens: 0, completion_tokens: 0 })
}

export async function fetchOpenRouterModels(apiKey: string): Promise<{ id: string; name: string }[]> {
  const res = await fetch(`${OPENROUTER_BASE}/models`, {
    headers: { Authorization: `Bearer ${apiKey}` },
  })
  if (!res.ok) throw new Error(`Failed to fetch models: ${res.status}`)
  const data = (await res.json()) as { data: { id: string; name: string }[] }
  return data.data
}
