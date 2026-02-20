import * as React from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'
import { useRef, useEffect } from 'react'
import { MessageBubble } from './MessageBubble'
import { SuggestionCards } from './SuggestionCards'
import { SkeletonMessage } from '@/components/common/SkeletonMessage'
import type { Message } from '@/types'

interface MessageListProps {
  messages?: Message[]
  isLoading?: boolean
  streamingMessageId?: string | null
  streamingContent?: string
  isStreaming?: boolean
  onSendMessage?: (message: string) => void
}

export function MessageList({
  messages,
  isLoading,
  streamingMessageId,
  streamingContent,
  isStreaming,
  onSendMessage,
}: MessageListProps) {
  const parentRef = useRef<HTMLDivElement>(null)
  const shouldAutoScroll = useRef(true)

  const virtualizer = useVirtualizer({
    count: messages?.length || 0,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 120,
    overscan: 5,
  })

  useEffect(() => {
    if (shouldAutoScroll.current && messages) {
      virtualizer.scrollToIndex(messages.length - 1)
    }
  }, [messages?.length, virtualizer])

  const handleScroll = () => {
    if (parentRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = parentRef.current
      shouldAutoScroll.current = scrollHeight - scrollTop - clientHeight < 100
    }
  }

  if (isLoading) {
    return (
      <div className="flex-1 overflow-auto p-4 space-y-4">
        <SkeletonMessage variant="user" />
        <SkeletonMessage variant="assistant" />
        <SkeletonMessage variant="assistant" />
      </div>
    )
  }

  if (!messages || messages.length === 0) {
    return (
      <div className="flex-1 overflow-auto p-4 flex flex-col items-center justify-center">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">⚡ Kogane</h1>
          <p className="text-muted-foreground">Your AI assistant for everything</p>
        </div>
        {onSendMessage && <SuggestionCards onSelectPrompt={onSendMessage} />}
      </div>
    )
  }

  return (
    <div
      ref={parentRef}
      className="flex-1 overflow-auto p-4"
      onScroll={handleScroll}
    >
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {virtualizer.getVirtualItems().map((virtualRow) => {
          const message = messages[virtualRow.index]
          const isLast = virtualRow.index === messages.length - 1
          const isStreamingThis = message.id === streamingMessageId

          return (
            <div
              key={virtualRow.key}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                transform: `translateY(${virtualRow.start}px)`,
              }}
              className="py-2"
            >
              <MessageBubble
                message={message}
                isStreaming={isStreamingThis}
                streamingContent={isStreamingThis ? streamingContent : undefined}
                isLast={isLast}
              />
            </div>
          )
        })}
      </div>
    </div>
  )
}