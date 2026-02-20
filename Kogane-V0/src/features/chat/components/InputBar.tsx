import * as React from 'react'
import { Send, Square } from 'lucide-react'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { useChatStore } from '@/stores/chat.store'
import { cn } from '@/lib/utils'

interface InputBarProps {
  onSend: (message: string) => void
  disabled?: boolean
}

export function InputBar({ onSend, disabled }: InputBarProps) {
  const [value, setValue] = React.useState('')
  const textareaRef = React.useRef<HTMLTextAreaElement>(null)
  const isStreaming = useChatStore((s) => s.isStreaming)

  const handleSubmit = () => {
    if (value.trim() && !disabled && !isStreaming) {
      onSend(value.trim())
      setValue('')
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  React.useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }, [value])

  return (
    <div className="border-t bg-background p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-end gap-2">
          <div className="flex-1">
            <Textarea
              ref={textareaRef}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message... (Press Enter to send, Shift+Enter for new line)"
              className="min-h-[60px] max-h-[200px] resize-none"
              disabled={disabled || isStreaming}
            />
          </div>
          <Button
            onClick={isStreaming ? useChatStore.getState().stopStreaming : handleSubmit}
            disabled={disabled || (!isStreaming && !value.trim())}
            size="lg"
          >
            {isStreaming ? <Square className="h-5 w-5" /> : <Send className="h-5 w-5" />}
          </Button>
        </div>
      </div>
    </div>
  )
}