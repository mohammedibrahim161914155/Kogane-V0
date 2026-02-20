import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import { db } from '@/db'
import { DEFAULT_MODEL, SETTINGS_ID, TOKEN_BUDGETS } from '@/lib/constants'
import type { AppSettings } from '@/types'

interface SettingsState {
  settings: AppSettings
  hydrated: boolean
  hydrate: () => Promise<void>
  updateSettings: (partial: Partial<AppSettings>) => Promise<void>
  setTheme: (theme: 'dark' | 'light' | 'system') => void
}

const defaults: AppSettings = {
  id: SETTINGS_ID,
  theme: 'dark',
  defaultModel: DEFAULT_MODEL,
  voiceEnabled: true,
  ttsVoice: '',
  sttLanguage: 'en-US',
  streamingEnabled: true,
  tokenBudget: TOKEN_BUDGETS,
  webSearchProvider: 'brave',
}

export const useSettingsStore = create<SettingsState>()(
  immer((set, get) => ({
    settings: defaults,
    hydrated: false,

    hydrate: async () => {
      const stored = await db.settings.get(SETTINGS_ID)
      if (stored) {
        set((state) => {
          state.settings = { ...defaults, ...stored }
          state.hydrated = true
        })
      } else {
        await db.settings.add(defaults)
        set((state) => { state.hydrated = true })
      }
      applyTheme(get().settings.theme)
    },

    updateSettings: async (partial) => {
      set((state) => {
        Object.assign(state.settings, partial)
      })
      await db.settings.update(SETTINGS_ID, partial)
      if (partial.theme) applyTheme(partial.theme)
    },

    setTheme: (theme) => {
      set((state) => { state.settings.theme = theme })
      applyTheme(theme)
      void db.settings.update(SETTINGS_ID, { theme })
    },
  })),
)

function applyTheme(theme: 'dark' | 'light' | 'system') {
  const html = document.documentElement
  if (theme === 'system') {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    html.setAttribute('data-theme', prefersDark ? 'dark' : 'light')
  } else {
    html.setAttribute('data-theme', theme)
  }
}
