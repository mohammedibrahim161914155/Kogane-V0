export const OPENROUTER_BASE = 'https://openrouter.ai/api/v1'
export const APP_NAME = 'Kogane'
export const APP_VERSION = '1.0.0'
export const DEFAULT_MODEL = 'anthropic/claude-3-5-haiku'
export const DEFAULT_TEMPERATURE = 0.7
export const DEFAULT_MAX_TOKENS = 4096
export const VAULT_SALT_KEY = 'kogane_vault_salt'
export const SETTINGS_ID = 'default'
export const SUMMARY_TRIGGER_MESSAGES = 20
export const RAG_TOP_K = 5
export const MAX_TOOL_ITERATIONS = 5
export const EMBEDDING_MODEL = 'Xenova/all-MiniLM-L6-v2'
export const TOKEN_BUDGETS = {
  system: 2000,
  memory: 1500,
  rag: 3000,
}
