import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import { nanoid } from 'nanoid'
import { db } from '@/db'
import { streamChat } from '@/core/ai/client'
import { loadApiKey } from '@/core/crypto/vault'
import { buildContext } from '@/core/context/builder'
import { generateTitle, estimateTokens } from '@/lib/utils'
import { useSettingsStore } from './settings.store'
import type { Message, Conversation } from '@/types'

// Re-export from lib
function _estimateTokens(text: string): number {
  return Math.ceil(text.length / 4)
}
void _estimateTokens
void estimateTokens

interface ChatState {
  activeConversationId: string | null
  streamingMessageId: string | null
  streamingContent: string
  isStreaming: boolean
  abortController: AbortController | null

  setActiveConversation: (id: string | null) => void
  createConversation: (model?: string, agentId?: string) => Promise<string>
  sendMessage: (content: string, attachments?: File[]) => Promise<void>
  stopStreaming: () => void
  deleteConversation: (id: string) => Promise<void>
  renameConversation: (id: string, title: string) => Promise<void>
  togglePin: (id: string) => Promise<void>
}

export const useChatStore = create<ChatState>()(
  immer((set, get) => ({
    activeConversationId: null,
    streamingMessageId: null,
    streamingContent: '',
    isStreaming: false,
    abortController: null,

    setActiveConversation: (id) => set((s) => { s.activeConversationId = id }),

    createConversation: async (model, agentId) => {
      const settings = useSettingsStore.getState().settings
      const id = nanoid()
      const conv: Conversation = {
        id,
        title: 'New Conversation',
        model: model ?? settings.defaultModel,
        agentId,
        pinned: false,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        messageCount: 0,
        tokenCount: 0,
        tags: [],
      }
      await db.conversations.add(conv)
      set((s) => { s.activeConversationId = id })
      return id
    },

    sendMessage: async (content, _attachments) => {
      const state = get()
      if (state.isStreaming) return

      let conversationId = state.activeConversationId
      if (!conversationId) {
        conversationId = await get().createConversation()
      }

      const conversation = await db.conversations.get(conversationId)
      if (!conversation) return

      const apiKey = await loadApiKey('openrouter')
      if (!apiKey) {
        const errMsgId = nanoid()
        await db.messages.add({
          id: errMsgId,
          conversationId,
          role: 'assistant',
          content: '⚠️ No API key configured. Please add your OpenRouter API key in Settings.',
          status: 'error',
          createdAt: Date.now(),
          updatedAt: Date.now(),
        })
        return
      }

      const userMsgId = nanoid()
      const userMsg: Message = {
        id: userMsgId,
        conversationId,
        role: 'user',
        content,
        status: 'done',
        tokenCount: Math.ceil(content.length / 4),
        createdAt: Date.now(),
        updatedAt: Date.now(),
      }
      await db.messages.add(userMsg)

      if (conversation.messageCount === 0) {
        const title = generateTitle(content)
        await db.conversations.update(conversationId, { title, messageCount: 1, updatedAt: Date.now() })
      } else {
        await db.conversations.update(conversationId, {
          messageCount: conversation.messageCount + 1,
          updatedAt: Date.now(),
        })
      }

      const assistantMsgId = nanoid()
      await db.messages.add({
        id: assistantMsgId,
        conversationId,
        role: 'assistant',
        content: '',
        status: 'streaming',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      })

      const controller = new AbortController()
      set((s) => {
        s.streamingMessageId = assistantMsgId
        s.streamingContent = ''
        s.isStreaming = true
        s.abortController = controller
      })

      const contextMessages = await buildContext(
        conversationId,
        conversation.agentId ? 'adaptive' : 'sliding_window',
        conversation.model,
        content,
      )

      let fullContent = ''

      await streamChat(
        {
          model: conversation.model,
          messages: [...contextMessages, { role: 'user', content }],
          temperature: 0.7,
          signal: controller.signal,
          onChunk: (chunk) => {
            fullContent += chunk
            set((s) => { s.streamingContent = fullContent })
            void db.messages.update(assistantMsgId, { content: fullContent, updatedAt: Date.now() })
          },
          onDone: async (usage) => {
            await db.messages.update(assistantMsgId, {
              content: fullContent,
              status: 'done',
              tokenCount: usage.completion_tokens || Math.ceil(fullContent.length / 4),
              model: conversation.model,
              updatedAt: Date.now(),
            })
            await db.conversations.update(conversationId!, {
              messageCount: (conversation.messageCount ?? 0) + 2,
              updatedAt: Date.now(),
            })
            set((s) => {
              s.isStreaming = false
              s.streamingMessageId = null
              s.streamingContent = ''
              s.abortController = null
            })
          },
          onError: async (err) => {
            const errContent = err.name === 'AbortError' ? fullContent : `Error: ${err.message}`
            await db.messages.update(assistantMsgId, {
              content: errContent,
              status: err.name === 'AbortError' ? 'done' : 'error',
              updatedAt: Date.now(),
            })
            set((s) => {
              s.isStreaming = false
              s.streamingMessageId = null
              s.streamingContent = ''
              s.abortController = null
            })
          },
        },
        apiKey,
      )
    },

    stopStreaming: () => {
      const { abortController } = get()
      abortController?.abort()
    },

    deleteConversation: async (id) => {
      await db.messages.where('conversationId').equals(id).delete()
      await db.conversations.delete(id)
      const state = get()
      if (state.activeConversationId === id) {
        set((s) => { s.activeConversationId = null })
      }
    },

    renameConversation: async (id, title) => {
      await db.conversations.update(id, { title })
    },

    togglePin: async (id) => {
      const conv = await db.conversations.get(id)
      if (conv) await db.conversations.update(id, { pinned: !conv.pinned })
    },
  })),
)
