import * as React from 'react'
import { User, Copy } from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { MarkdownRenderer } from '@/components/common/MarkdownRenderer'
import { StreamingCursor } from './StreamingCursor'
import { ToolCallBlock } from './ToolCallBlock'
import { cn } from '@/lib/utils'
import type { Message } from '@/types'

interface MessageBubbleProps {
  message: Message
  isStreaming?: boolean
  streamingContent?: string
  isLast?: boolean
  onRegenerate?: () => void
}

export function MessageBubble({ message, isStreaming, streamingContent, isLast, onRegenerate }: MessageBubbleProps) {
  const isUser = message.role === 'user'

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(message.content)
  }

  return (
    <div className={cn('flex gap-3', isUser && 'flex-row-reverse')}>
      {!isUser && (
        <Avatar className="h-8 w-8">
          <AvatarFallback className="bg-primary/10">🤖</AvatarFallback>
        </Avatar>
      )}
      <div className={cn('group relative max-w-[80%]', isUser && 'flex justify-end')}>
        <div
          className={cn(
            'rounded-lg px-4 py-3',
            isUser
              ? 'bg-primary text-primary-foreground ml-auto'
              : 'bg-card border',
            message.status === 'error' && 'border-destructive'
          )}
        >
          {message.content && (
            <div className={cn('prose prose-invert max-w-none', !isUser && 'prose-invert')}>
              {isUser ? (
                <p>{message.content}</p>
              ) : (
                <MarkdownRenderer content={isStreaming && isLast ? streamingContent || '' : message.content} />
              )}
              {isStreaming && isLast && <StreamingCursor />}
            </div>
          )}

          {message.toolCalls && message.toolCalls.length > 0 && (
            <div className="mt-2">
              <ToolCallBlock toolCalls={message.toolCalls} toolResults={message.toolResults} />
            </div>
          )}
        </div>

        {!isUser && !isStreaming && (
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button size="sm" variant="ghost" onClick={copyToClipboard}>
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        )}

        {!isUser && isLast && !isStreaming && (
          <div className="mt-2">
            <Button size="sm" variant="outline" onClick={onRegenerate}>
              Regenerate
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}