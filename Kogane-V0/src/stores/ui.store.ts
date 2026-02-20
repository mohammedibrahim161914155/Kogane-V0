import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'

interface UIState {
  sidebarOpen: boolean
  mobileTab: 'chat' | 'agents' | 'skills' | 'personas' | 'settings'
  installPromptEvent: BeforeInstallPromptEvent | null
  updateAvailable: boolean
  offlineReady: boolean
  isOnline: boolean
  setSidebarOpen: (open: boolean) => void
  toggleSidebar: () => void
  setMobileTab: (tab: UIState['mobileTab']) => void
  setInstallPrompt: (event: BeforeInstallPromptEvent) => void
  setUpdateAvailable: (v: boolean) => void
  setOfflineReady: (v: boolean) => void
  setOnline: (v: boolean) => void
}

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export const useUIStore = create<UIState>()(
  immer((set) => ({
    sidebarOpen: true,
    mobileTab: 'chat',
    installPromptEvent: null,
    updateAvailable: false,
    offlineReady: false,
    isOnline: navigator.onLine,

    setSidebarOpen: (open) => set((s) => { s.sidebarOpen = open }),
    toggleSidebar: () => set((s) => { s.sidebarOpen = !s.sidebarOpen }),
    setMobileTab: (tab) => set((s) => { s.mobileTab = tab }),
    setInstallPrompt: (event) => set((s) => { s.installPromptEvent = event }),
    setUpdateAvailable: (v) => set((s) => { s.updateAvailable = v }),
    setOfflineReady: (v) => set((s) => { s.offlineReady = v }),
    setOnline: (v) => set((s) => { s.isOnline = v }),
  })),
)
