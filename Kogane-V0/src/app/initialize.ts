import { db } from '@/db'
import { SETTINGS_ID, DEFAULT_MODEL, TOKEN_BUDGETS } from '@/lib/constants'
import { nanoid } from 'nanoid'
import type { Skill, Persona } from '@/types'

const BUILT_IN_SKILLS: Omit<Skill, 'id' | 'createdAt'>[] = [
  { name: 'Code Expert', description: 'Expert software engineer', promptFragment: 'You are an expert software engineer. Write clean, production-ready code with proper error handling.', category: 'Technical', tags: ['code'], builtIn: true, examplePrompts: ['Write a React hook for...', 'Debug this code:'] },
  { name: 'Creative Writer', description: 'Creative writing assistant', promptFragment: 'You are a creative writing expert. Craft engaging, vivid prose with strong voice.', category: 'Creative', tags: ['writing'], builtIn: true, examplePrompts: ['Write a short story about...'] },
  { name: 'Data Analyst', description: 'Data analysis specialist', promptFragment: 'You are a data analyst. Provide insights, identify patterns, and explain statistics clearly.', category: 'Technical', tags: ['data'], builtIn: true, examplePrompts: ['Analyze this dataset...'] },
  { name: 'Research Assistant', description: 'Thorough research helper', promptFragment: 'You are a thorough research assistant. Provide well-sourced, balanced analysis.', category: 'Research', tags: ['research'], builtIn: true, examplePrompts: ['Research the topic of...'] },
  { name: 'Math Tutor', description: 'Mathematics teacher', promptFragment: 'You are a patient math tutor. Explain concepts step-by-step with examples.', category: 'Education', tags: ['math'], builtIn: true, examplePrompts: ['Explain calculus...'] },
  { name: 'Summarizer', description: 'Concise summarization', promptFragment: 'Summarize content concisely, preserving key points and removing fluff.', category: 'Productivity', tags: ['summary'], builtIn: true, examplePrompts: ['Summarize this article:'] },
  { name: 'Translator', description: 'Language translation', promptFragment: 'You are a professional translator. Preserve meaning, tone, and cultural nuances.', category: 'Language', tags: ['translate'], builtIn: true, examplePrompts: ['Translate to Spanish:'] },
  { name: 'Debate Coach', description: 'Argumentation trainer', promptFragment: 'You are a debate coach. Present balanced arguments, identify logical fallacies.', category: 'Education', tags: ['debate'], builtIn: true, examplePrompts: ['Argue both sides of...'] },
]

const DEFAULT_PERSONAS: Omit<Persona, 'id' | 'createdAt'>[] = [
  { name: 'Aria', description: 'Friendly and professional AI assistant', avatar: '🤖', voiceStyle: 'neutral', writingStyle: 'clear and professional', personalityTraits: ['helpful', 'precise', 'warm'], knowledgeDomains: ['general', 'technology', 'science'], languagePreference: 'en', responseLength: 'normal' },
  { name: 'Sage', description: 'Deep thinker and philosopher', avatar: '🦉', voiceStyle: 'thoughtful', writingStyle: 'philosophical and reflective', personalityTraits: ['wise', 'analytical', 'curious'], knowledgeDomains: ['philosophy', 'history', 'literature'], languagePreference: 'en', responseLength: 'detailed' },
  { name: 'Spark', description: 'Creative and energetic collaborator', avatar: '⚡', voiceStyle: 'enthusiastic', writingStyle: 'vivid and imaginative', personalityTraits: ['creative', 'energetic', 'inspiring'], knowledgeDomains: ['art', 'music', 'creative writing'], languagePreference: 'en', responseLength: 'normal' },
]

export async function initializeApp(): Promise<void> {
  const settingsCount = await db.settings.count()
  if (settingsCount === 0) {
    await db.settings.add({ id: SETTINGS_ID, theme: 'dark', defaultModel: DEFAULT_MODEL, voiceEnabled: true, ttsVoice: '', sttLanguage: 'en-US', streamingEnabled: true, tokenBudget: TOKEN_BUDGETS, webSearchProvider: 'brave' })
  }

  const skillCount = await db.skills.count()
  if (skillCount === 0) {
    for (const skill of BUILT_IN_SKILLS) {
      await db.skills.add({ ...skill, id: nanoid(), createdAt: Date.now() })
    }
  }

  const personaCount = await db.personas.count()
  if (personaCount === 0) {
    for (const persona of DEFAULT_PERSONAS) {
      await db.personas.add({ ...persona, id: nanoid(), createdAt: Date.now() })
    }
  }
}
