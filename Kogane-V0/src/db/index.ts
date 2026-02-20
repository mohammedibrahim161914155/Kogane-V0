import Dexie, { type EntityTable } from 'dexie'
import type {
  Conversation,
  Message,
  Agent,
  Skill,
  Persona,
  Memory,
  Document,
  Chunk,
  Vector,
  Folder,
  ApiKey,
  ToolLog,
  Summary,
  AppSettings,
} from '@/types'

class KoganeDB extends Dexie {
  conversations!: EntityTable<Conversation, 'id'>
  messages!: EntityTable<Message, 'id'>
  agents!: EntityTable<Agent, 'id'>
  skills!: EntityTable<Skill, 'id'>
  personas!: EntityTable<Persona, 'id'>
  memories!: EntityTable<Memory, 'id'>
  summaries!: EntityTable<Summary, 'id'>
  documents!: EntityTable<Document, 'id'>
  chunks!: EntityTable<Chunk, 'id'>
  vectors!: EntityTable<Vector, 'id'>
  folders!: EntityTable<Folder, 'id'>
  apiKeys!: EntityTable<ApiKey, 'id'>
  toolLogs!: EntityTable<ToolLog, 'id'>
  settings!: EntityTable<AppSettings, 'id'>

  constructor() {
    super('KoganeDB')
    this.version(1).stores({
      conversations: 'id, updatedAt, folderId, pinned, agentId',
      messages: 'id, conversationId, createdAt, role, status',
      agents: 'id, name, folderId, updatedAt',
      skills: 'id, name, category, builtIn',
      personas: 'id, name',
      memories: 'id, conversationId, tier, createdAt, importance',
      summaries: 'id, conversationId',
      documents: 'id, agentId, createdAt',
      chunks: 'id, documentId',
      vectors: 'id, chunkId, documentId',
      folders: 'id, type, parentId',
      apiKeys: 'id, provider, isDefault',
      toolLogs: 'id, conversationId, messageId, createdAt',
      settings: 'id',
    })
  }
}

export const db = new KoganeDB()
