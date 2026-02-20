import * as React from 'react'
import { useSettingsStore } from '@/stores/settings.store'

interface ThemeProviderProps {
  children: React.ReactNode
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const hydrated = useSettingsStore((s) => s.hydrated)
  const theme = useSettingsStore((s) => s.settings.theme)

  React.useEffect(() => {
    if (!hydrated) {
      useSettingsStore.getState().hydrate()
    }
  }, [hydrated])

  React.useEffect(() => {
    const html = document.documentElement
    if (theme === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      html.setAttribute('data-theme', prefersDark ? 'dark' : 'light')
    } else {
      html.setAttribute('data-theme', theme)
    }
  }, [theme])

  React.useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = () => {
      const currentTheme = useSettingsStore.getState().settings.theme
      if (currentTheme === 'system') {
        const prefersDark = mediaQuery.matches
        document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light')
      }
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  return <>{children}</>
}