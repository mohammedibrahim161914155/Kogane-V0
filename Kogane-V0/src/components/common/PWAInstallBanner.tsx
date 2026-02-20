import * as React from 'react'
import { X, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useUIStore } from '@/stores/ui.store'

const DISMISSED_KEY = 'pwa_install_dismissed'

export function PWAInstallBanner() {
  const installPromptEvent = useUIStore((s) => s.installPromptEvent)
  const [dismissed, setDismissed] = React.useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(DISMISSED_KEY) === 'true'
    }
    return false
  })
  const [show, setShow] = React.useState(false)

  React.useEffect(() => {
    if (installPromptEvent && !dismissed) {
      setShow(true)
    }
  }, [installPromptEvent, dismissed])

  if (!show || !installPromptEvent) return null

  const handleInstall = async () => {
    if (!installPromptEvent) return
    installPromptEvent.prompt()
    const { outcome } = await installPromptEvent.userChoice
    if (outcome === 'accepted') {
      setShow(false)
    }
  }

  const handleDismiss = () => {
    setDismissed(true)
    setShow(false)
    localStorage.setItem(DISMISSED_KEY, 'true')
  }

  return (
    <div className="bg-accent border-b px-4 py-2 flex items-center justify-between gap-4">
      <span className="text-sm">Install Kogane for the best experience</span>
      <div className="flex items-center gap-2">
        <Button size="sm" onClick={handleInstall}>
          <Download className="h-4 w-4 mr-1" />
          Install
        </Button>
        <Button size="sm" variant="ghost" onClick={handleDismiss}>
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}