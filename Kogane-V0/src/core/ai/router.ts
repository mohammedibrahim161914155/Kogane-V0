import { MODELS } from '@/core/ai/models'

export function routeModel(taskType: 'code' | 'creative' | 'reasoning' | 'general' | 'vision', availableModels: string[] = MODELS.map(m => m.id)): string {
  const modelPreferences: Record<typeof taskType, string[]> = {
    code: ['deepseek-chat', 'anthropic/claude-3-5-sonnet', 'openai/gpt-4o', 'anthropic/claude-3-haiku'],
    creative: ['anthropic/claude-3-5-sonnet', 'openai/gpt-4o', 'anthropic/claude-3-opus'],
    reasoning: ['openai/o3-mini', 'deepseek-reasoner', 'anthropic/claude-3-opus', 'anthropic/claude-3-5-sonnet'],
    general: ['anthropic/claude-3-haiku', 'google/gemini-flash-1.5', 'meta-llama/llama-3.2-3b-instruct'],
    vision: ['openai/gpt-4o', 'anthropic/claude-3-5-sonnet', 'google/gemini-flash-1.5'],
  }

  const preferredModels = modelPreferences[taskType]
  
  for (const modelId of preferredModels) {
    if (availableModels.includes(modelId)) {
      return modelId
    }
  }

  return MODELS.find(m => m.provider === 'anthropic' && m.id.includes('haiku'))?.id || MODELS[0]?.id || 'anthropic/claude-3-5-haiku'
}