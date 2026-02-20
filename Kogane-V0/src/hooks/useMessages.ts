import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/db'
import type { Message } from '@/types'

interface UseMessagesOptions {
  conversationId?: string
}

export function useMessages({ conversationId }: UseMessagesOptions = {}) {
  const messages = useLiveQuery(
    () =>
      conversationId
        ? db.messages
            .where('conversationId')
            .equals(conversationId)
            .sortBy('createdAt')
        : [],
    [conversationId]
  )

  return {
    messages,
    isLoading: messages === undefined,
  }
}