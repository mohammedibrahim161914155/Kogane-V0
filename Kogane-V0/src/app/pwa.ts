import { registerSW } from 'virtual:pwa-register'
import { useUIStore } from '@/stores/ui.store'

export function initPWA(): void {
  registerSW({
    onNeedRefresh() { useUIStore.getState().setUpdateAvailable(true) },
    onOfflineReady() { useUIStore.getState().setOfflineReady(true) },
  })

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault()
    useUIStore.getState().setInstallPrompt(e as Parameters<typeof useUIStore.getState().setInstallPrompt>[0])
  })

  window.addEventListener('online', () => useUIStore.getState().setOnline(true))
  window.addEventListener('offline', () => useUIStore.getState().setOnline(false))
}
