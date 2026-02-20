import { useChatStore } from '@/stores/chat.store'
import type { File } from '@/types'

export function useChat() {
  const {
    activeConversationId,
    streamingMessageId,
    streamingContent,
    isStreaming,
    setActiveConversation,
    createConversation,
    sendMessage,
    stopStreaming,
    deleteConversation,
    renameConversation,
    togglePin,
  } = useChatStore()

  const handleSendMessage = async (content: string, attachments?: File[]) => {
    await sendMessage(content, attachments)
  }

  const handleCreateConversation = async (model?: string, agentId?: string) => {
    return createConversation(model, agentId)
  }

  return {
    activeConversationId,
    streamingMessageId,
    streamingContent,
    isStreaming,
    setActiveConversation,
    createConversation: handleCreateConversation,
    sendMessage: handleSendMessage,
    stopStreaming,
    deleteConversation,
    renameConversation,
    togglePin,
  }
}