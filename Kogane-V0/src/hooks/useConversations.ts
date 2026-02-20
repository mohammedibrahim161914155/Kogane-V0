import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/db'
import { useChatStore } from '@/stores/chat.store'
import type { Conversation, Folder } from '@/types'

export function useConversations() {
  const conversations = useLiveQuery(() =>
    db.conversations.orderBy('updatedAt').reverse().toArray()
  )
  const folders = useLiveQuery(() =>
    db.folders.where('type').equals('conversations').toArray()
  )
  const { createConversation, deleteConversation, renameConversation, togglePin, setActiveConversation, activeConversationId } = useChatStore()

  const pinned = conversations?.filter((c) => c.pinned) ?? []
  const unpinned = conversations?.filter((c) => !c.pinned) ?? []
  const isLoading = conversations === undefined

  const moveToFolder = async (conversationId: string, folderId: string | undefined) => {
    await db.conversations.update(conversationId, { folderId })
  }

  return {
    conversations,
    pinned,
    unpinned,
    folders,
    isLoading,
    createConversation: () => createConversation(),
    deleteConversation,
    renameConversation,
    togglePin,
    setActiveConversation,
    moveToFolder,
    activeConversationId,
  }
}