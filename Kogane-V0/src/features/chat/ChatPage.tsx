import * as React from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { MessageList } from './components/MessageList'
import { InputBar } from './components/InputBar'
import { useChat } from '@/hooks/useChat'
import { useMessages } from '@/hooks/useMessages'
import { SkeletonMessage } from '@/components/common/SkeletonMessage'

export function ChatPage() {
  const { conversationId } = useParams()
  const navigate = useNavigate()
  const { activeConversationId, setActiveConversation, sendMessage, isStreaming } = useChat()
  const { messages, isLoading } = useMessages({ conversationId: activeConversationId || conversationId })

  React.useEffect(() => {
    if (conversationId && conversationId !== activeConversationId) {
      setActiveConversation(conversationId)
    }
  }, [conversationId, activeConversationId, setActiveConversation])

  const handleSendMessage = async (content: string) => {
    await sendMessage(content)
  }

  if (!conversationId && !activeConversationId) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex-1 overflow-auto p-4">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-2">⚡ Kogane</h1>
            <p className="text-muted-foreground">Your AI assistant for everything</p>
          </div>
        </div>
        <InputBar onSend={handleSendMessage} />
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <MessageList
        messages={messages}
        isLoading={isLoading}
        isStreaming={isStreaming}
        onSendMessage={handleSendMessage}
      />
      <InputBar onSend={handleSendMessage} disabled={!activeConversationId} />
    </div>
  )
}