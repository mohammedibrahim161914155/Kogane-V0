import { useUIStore } from '@/stores/ui.store'

interface UsePWAReturn {
  installPromptEvent: BeforeInstallPromptEvent | null
  updateAvailable: boolean
  offlineReady: boolean
  isOnline: boolean
  install: () => Promise<void>
  dismissUpdate: () => void
  reloadForUpdate: () => void
}

export function usePWA(): UsePWAReturn {
  const installPromptEvent = useUIStore((s) => s.installPromptEvent)
  const updateAvailable = useUIStore((s) => s.updateAvailable)
  const offlineReady = useUIStore((s) => s.offlineReady)
  const isOnline = useUIStore((s) => s.isOnline)

  const install = async () => {
    if (!installPromptEvent) return
    installPromptEvent.prompt()
    await installPromptEvent.userChoice
  }

  const dismissUpdate = () => {
    useUIStore.getState().setUpdateAvailable(false)
  }

  const reloadForUpdate = () => {
    window.location.reload()
  }

  return {
    installPromptEvent,
    updateAvailable,
    offlineReady,
    isOnline,
    install,
    dismissUpdate,
    reloadForUpdate,
  }
}