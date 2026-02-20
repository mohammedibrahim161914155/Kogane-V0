import { db } from '@/db'
import { nanoid } from 'nanoid'
import { streamChat } from '@/core/ai/client'
import type { Message } from '@/types'

export async function summarizeOldMessages(
  conversationId: string,
  apiKey: string,
  model: string,
): Promise<void> {
  const messages = await db.messages
    .where('conversationId')
    .equals(conversationId)
    .sortBy('createdAt')

  if (messages.length < 20) return

  const toSummarize = messages.slice(0, messages.length - 10)
  if (toSummarize.length === 0) return

  const transcript = toSummarize
    .map((m) => `${m.role.toUpperCase()}: ${m.content}`)
    .join('\n\n')

  let summary = ''
  await streamChat(
    {
      model,
      messages: [
        {
          role: 'system',
          content: 'Summarize the following conversation concisely, preserving key facts and decisions.',
        },
        { role: 'user', content: transcript },
      ],
      maxTokens: 512,
      onChunk: (chunk) => { summary += chunk },
      onDone: () => {},
      onError: (err) => { console.error('Summary error:', err) },
    },
    apiKey,
  )

  if (!summary) return

  await db.summaries.add({
    id: nanoid(),
    conversationId,
    content: summary,
    messageRange: [0, toSummarize.length - 1],
    createdAt: Date.now(),
  })

  await extractFacts(toSummarize, conversationId, apiKey, model)
}

export async function extractFacts(
  messages: Message[],
  conversationId: string,
  apiKey: string,
  model: string,
): Promise<void> {
  const transcript = messages
    .slice(-10)
    .map((m) => `${m.role}: ${m.content}`)
    .join('\n')

  let facts = ''
  await streamChat(
    {
      model,
      messages: [
        {
          role: 'system',
          content:
            'Extract 3-5 key facts, preferences, or important details from this conversation. Return as a JSON array of strings.',
        },
        { role: 'user', content: transcript },
      ],
      maxTokens: 256,
      onChunk: (chunk) => { facts += chunk },
      onDone: () => {},
      onError: () => {},
    },
    apiKey,
  )

  try {
    const match = facts.match(/\[.*\]/s)
    if (!match) return
    const parsed = JSON.parse(match[0]) as string[]
    for (const fact of parsed) {
      await db.memories.add({
        id: nanoid(),
        conversationId,
        tier: 'episodic',
        content: fact,
        importance: 0.7,
        createdAt: Date.now(),
        tags: [],
      })
    }
  } catch {
    // ignore parse errors
  }
}
