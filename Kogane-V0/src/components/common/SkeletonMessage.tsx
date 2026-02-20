import * as React from 'react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'

interface SkeletonMessageProps {
  variant?: 'user' | 'assistant'
  className?: string
}

export function SkeletonMessage({ variant = 'assistant', className }: SkeletonMessageProps) {
  const isUser = variant === 'user'

  return (
    <div className={cn('flex gap-3', isUser ? 'flex-row-reverse' : '', className)}>
      {!isUser && (
        <Avatar className="h-8 w-8">
          <AvatarFallback className="bg-muted">🤖</AvatarFallback>
        </Avatar>
      )}
      <div
        className={cn(
          'rounded-lg px-4 py-3 max-w-[80%]',
          isUser ? 'bg-primary/10' : 'bg-card border'
        )}
      >
        <div className="flex flex-col gap-2">
          <div className="h-4 w-32 bg-muted animate-pulse rounded" />
          <div className="h-4 w-48 bg-muted animate-pulse rounded" />
          <div className="h-4 w-24 bg-muted animate-pulse rounded" />
        </div>
      </div>
    </div>
  )
}