import { streamChat } from '@/core/ai/client'
import { loadApiKey } from '@/core/crypto/vault'
import { buildContext } from '@/core/context/builder'
import { TOOL_REGISTRY } from '@/core/harness/registry'
import { db } from '@/db'
import { nanoid } from 'nanoid'
import { MAX_TOOL_ITERATIONS } from '@/lib/constants'
import type { ChatMessage } from '@/types'

interface RunAgentLoopParams {
  conversationId: string
  messages: ChatMessage[]
  model: string
  apiKey: string
  maxIterations?: number
  onChunk?: (chunk: string) => void
  onToolCall?: (call: { id: string; name: string; arguments: string }) => void
  onDone?: (content: string) => void
  onError?: (error: Error) => void
}

export async function runAgentLoop(params: RunAgentLoopParams): Promise<void> {
  const {
    conversationId,
    messages,
    model,
    apiKey,
    maxIterations = MAX_TOOL_ITERATIONS,
    onChunk,
    onToolCall,
    onDone,
    onError,
  } = params

  let currentMessages = [...messages]
  let accumulatedContent = ''

  for (let iteration = 0; iteration < maxIterations; iteration++) {
    try {
      let toolCalls: Array<{ id: string; name: string; arguments: string }> = []
      let hasToolCalls = false

      await streamChat(
        {
          model,
          messages: currentMessages,
          tools: Object.values(TOOL_REGISTRY),
          onChunk: (chunk) => {
            accumulatedContent += chunk
            onChunk?.(chunk)
          },
          onToolCall: (call) => {
            toolCalls.push(call)
            onToolCall?.(call)
          },
          onDone: () => {},
          onError: (error) => {
            onError?.(error)
          },
        },
        apiKey,
      )

      if (toolCalls.length === 0) {
        break
      }

      hasToolCalls = true

      const toolResults = []
      for (const call of toolCalls) {
        try {
          const tool = TOOL_REGISTRY[call.name]
          if (!tool) {
            throw new Error(`Tool not found: ${call.name}`)
          }

          const startTime = Date.now()
          const result = await tool.execute(JSON.parse(call.arguments))
          const duration = Date.now() - startTime

          await db.toolLogs.add({
            id: nanoid(),
            conversationId,
            messageId: '', 
            tool: call.name,
            input: JSON.parse(call.arguments),
            output: result,
            durationMs: duration,
            createdAt: Date.now(),
          })

          toolResults.push({
            tool_call_id: call.id,
            result,
            error: null,
          })
        } catch (error) {
          toolResults.push({
            tool_call_id: call.id,
            result: null,
            error: error instanceof Error ? error.message : 'Unknown error',
          })
        }
      }

      currentMessages.push(
        { role: 'assistant', content: accumulatedContent },
        {
          role: 'tool',
          content: JSON.stringify(toolResults),
        } as ChatMessage
      )

      accumulatedContent = ''
    } catch (error) {
      onError?.(error instanceof Error ? error : new Error('Unknown error'))
      return
    }
  }

  if (accumulatedContent) {
    onDone?.(accumulatedContent)
  } else if (onError) {
    onError(new Error('No content generated'))
  }
}