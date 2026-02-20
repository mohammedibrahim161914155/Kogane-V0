export type MessageRole = 'user' | 'assistant' | 'system' | 'tool'
export type MessageStatus = 'pending' | 'streaming' | 'done' | 'error'
export type ContextStrategy =
  | 'sliding_window'
  | 'summarize_and_slide'
  | 'full_history'
  | 'rag_focused'
  | 'adaptive'
export type MemoryTier = 'working' | 'episodic' | 'semantic'
export type ModelCapability =
  | 'vision'
  | 'tools'
  | 'reasoning'
  | 'code'
  | 'math'
  | 'multimodal'
  | 'fast'
  | 'long-context'

export interface Conversation {
  id: string
  title: string
  agentId?: string
  folderId?: string
  pinned: boolean
  model: string
  systemPrompt?: string
  createdAt: number
  updatedAt: number
  messageCount: number
  tokenCount: number
  tags: string[]
}

export interface Message {
  id: string
  conversationId: string
  role: MessageRole
  content: string
  status: MessageStatus
  model?: string
  toolCalls?: ToolCall[]
  toolResults?: ToolResult[]
  attachments?: Attachment[]
  tokenCount?: number
  cost?: number
  createdAt: number
  updatedAt: number
}

export interface Agent {
  id: string
  name: string
  description: string
  avatar: string
  systemPrompt: string
  model: string
  temperature: number
  maxTokens: number
  skills: string[]
  tools: string[]
  personaId?: string
  webSearch: boolean
  memoryEnabled: boolean
  ragEnabled: boolean
  contextStrategy: ContextStrategy
  responseFormat?: 'text' | 'json' | 'markdown'
  createdAt: number
  updatedAt: number
  folderId?: string
  tags: string[]
}

export interface Skill {
  id: string
  name: string
  description: string
  promptFragment: string
  category: string
  tags: string[]
  builtIn: boolean
  examplePrompts: string[]
  createdAt: number
}

export interface Persona {
  id: string
  name: string
  description: string
  avatar: string
  voiceStyle: string
  writingStyle: string
  personalityTraits: string[]
  knowledgeDomains: string[]
  languagePreference: string
  responseLength: 'brief' | 'normal' | 'detailed'
  createdAt: number
}

export interface Memory {
  id: string
  conversationId?: string
  tier: MemoryTier
  content: string
  embedding?: number[]
  importance: number
  createdAt: number
  expiresAt?: number
  tags: string[]
}

export interface Document {
  id: string
  name: string
  type: string
  size: number
  content: string
  agentId?: string
  createdAt: number
}

export interface Chunk {
  id: string
  documentId: string
  content: string
  index: number
  tokenCount: number
}

export interface Vector {
  id: string
  chunkId: string
  documentId: string
  embedding: number[]
  createdAt: number
}

export interface Folder {
  id: string
  name: string
  color: string
  icon: string
  parentId?: string
  type: 'conversations' | 'agents'
}

export interface ApiKey {
  id: string
  provider: string
  label: string
  encryptedKey: string
  iv: string
  createdAt: number
  lastTested?: number
  isDefault: boolean
}

export interface ToolLog {
  id: string
  conversationId: string
  messageId: string
  tool: string
  input: unknown
  output: unknown
  error?: string
  durationMs: number
  createdAt: number
}

export interface Summary {
  id: string
  conversationId: string
  content: string
  messageRange: [number, number]
  createdAt: number
}

export interface AppSettings {
  id: string
  theme: 'dark' | 'light' | 'system'
  defaultModel: string
  defaultAgentId?: string
  voiceEnabled: boolean
  ttsVoice: string
  sttLanguage: string
  streamingEnabled: boolean
  tokenBudget: { system: number; memory: number; rag: number }
  webSearchProvider: string
  webSearchApiKey?: string
}

export interface ToolCall {
  id: string
  name: string
  arguments: Record<string, unknown>
}

export interface ToolResult {
  id: string
  toolCallId: string
  result: unknown
  error?: string
}

export interface Attachment {
  id: string
  name: string
  type: string
  size: number
  content: string
}

export interface AIModel {
  id: string
  name: string
  provider: string
  contextWindow: number
  maxOutput: number
  capabilities: ModelCapability[]
  pricing: { prompt: number; completion: number }
  description: string
}

export interface ToolDefinition {
  name: string
  description: string
  parameters: Record<string, { type: string; description?: string; enum?: string[] }>
  execute: (args: Record<string, unknown>) => Promise<unknown>
}

export interface ChatMessage {
  role: MessageRole | 'system'
  content: string | ContentPart[]
  tool_call_id?: string
  name?: string
}

export type ContentPart =
  | { type: 'text'; text: string }
  | { type: 'image_url'; image_url: { url: string } }
