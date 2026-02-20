import * as React from 'react'
import { Wrench, ChevronDown, ChevronRight, CheckCircle, XCircle, Loader2 } from 'lucide-react'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { ToolCall, ToolResult } from '@/types'

interface ToolCallBlockProps {
  toolCalls: ToolCall[]
  toolResults?: ToolResult[]
}

export function ToolCallBlock({ toolCalls, toolResults }: ToolCallBlockProps) {
  const [isOpen, setIsOpen] = React.useState(false)

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
        {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        <Wrench className="h-4 w-4" />
        <span>{toolCalls.length} tool(s) used</span>
      </CollapsibleTrigger>
      <CollapsibleContent className="space-y-2 mt-2">
        {toolCalls.map((call, idx) => {
          const result = toolResults?.find((r) => r.toolCallId === call.id)
          const status = result?.error ? 'error' : result?.result ? 'done' : 'pending'

          return (
            <div
              key={call.id}
              className={cn(
                'rounded-lg border p-3 text-sm',
                status === 'error' && 'border-destructive/50 bg-destructive/10',
                status === 'done' && 'border-green-500/50 bg-green-500/10',
                status === 'pending' && 'border-yellow-500/50 bg-yellow-500/10'
              )}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono font-medium">{call.name}</span>
                <Badge
                  variant={
                    status === 'error' ? 'destructive' : status === 'done' ? 'success' : 'warning'
                  }
                >
                  {status === 'pending' && <Loader2 className="h-3 w-3 mr-1 animate-spin" />}
                  {status === 'done' && <CheckCircle className="h-3 w-3 mr-1" />}
                  {status === 'error' && <XCircle className="h-3 w-3 mr-1" />}
                  {status}
                </Badge>
              </div>
              <pre className="text-xs bg-muted/50 rounded p-2 overflow-x-auto">
                {JSON.stringify(call.arguments, null, 2)}
              </pre>
              {result && (
                <pre className="text-xs bg-muted/50 rounded p-2 mt-2 overflow-x-auto">
                  {result.error
                    ? `Error: ${result.error}`
                    : JSON.stringify(result.result, null, 2)}
                </pre>
              )}
            </div>
          )
        })}
      </CollapsibleContent>
    </Collapsible>
  )
}