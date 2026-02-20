import { db } from '@/db'
import { estimateTokens } from '@/lib/tokens'
import { searchSimilar } from '@/core/memory/semantic'
import type { ChatMessage, ContextStrategy } from '@/types'
import { TOKEN_BUDGETS } from '@/lib/constants'

export async function buildContext(
  conversationId: string,
  strategy: ContextStrategy,
  model: string,
  ragQuery?: string,
): Promise<ChatMessage[]> {
  const conversation = await db.conversations.get(conversationId)
  if (!conversation) return []

  const allMessages = await db.messages
    .where('conversationId')
    .equals(conversationId)
    .and((m) => m.status === 'done' || m.role === 'user')
    .sortBy('createdAt')

  const contextMessages: ChatMessage[] = []
  let totalTokens = 0
  const modelContextWindow = 128000
  const maxHistory = modelContextWindow - TOKEN_BUDGETS.system - TOKEN_BUDGETS.memory - TOKEN_BUDGETS.rag - 1000

  if (conversation.systemPrompt) {
    contextMessages.push({ role: 'system', content: conversation.systemPrompt })
    totalTokens += estimateTokens(conversation.systemPrompt)
  }

  if (ragQuery) {
    const chunks = await searchSimilar(ragQuery, 5)
    if (chunks.length > 0) {
      const ragContent = chunks.map((c) => c.content).join('\n\n---\n\n')
      if (estimateTokens(ragContent) <= TOKEN_BUDGETS.rag) {
        contextMessages.push({
          role: 'system',
          content: `Relevant context from documents:\n\n${ragContent}`,
        })
        totalTokens += estimateTokens(ragContent)
      }
    }
  }

  const memories = await db.memories
    .where('conversationId')
    .equals(conversationId)
    .and((m) => m.tier === 'episodic')
    .sortBy('importance')

  if (memories.length > 0) {
    const memContent = memories
      .slice(-5)
      .map((m) => `• ${m.content}`)
      .join('\n')
    const memToken = estimateTokens(memContent)
    if (memToken <= TOKEN_BUDGETS.memory) {
      contextMessages.push({
        role: 'system',
        content: `Key facts from our conversation:\n${memContent}`,
      })
      totalTokens += memToken
    }
  }

  let historyMessages = allMessages
  if (strategy === 'summarize_and_slide') {
    const summaries = await db.summaries.where('conversationId').equals(conversationId).toArray()
    if (summaries.length > 0) {
      const latestSummary = summaries[summaries.length - 1]!
      contextMessages.push({
        role: 'system',
        content: `Earlier conversation summary:\n${latestSummary.content}`,
      })
      historyMessages = allMessages.slice(-10)
    }
  } else if (strategy === 'sliding_window') {
    historyMessages = allMessages.slice(-20)
  } else if (strategy === 'adaptive') {
    const tokenCount = allMessages.reduce((acc, m) => acc + estimateTokens(m.content), 0)
    if (tokenCount > maxHistory * 0.8) {
      historyMessages = allMessages.slice(-15)
    }
  }

  for (const msg of historyMessages) {
    const tokens = estimateTokens(msg.content)
    if (totalTokens + tokens > maxHistory) break
    contextMessages.push({ role: msg.role, content: msg.content })
    totalTokens += tokens
  }

  void model

  return contextMessages
}
