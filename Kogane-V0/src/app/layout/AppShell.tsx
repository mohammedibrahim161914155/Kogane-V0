import * as React from 'react'
import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { BottomNav } from './BottomNav'
import { PWAInstallBanner } from '@/components/common/PWAInstallBanner'
import { OfflineBanner } from '@/components/common/OfflineBanner'
import { useUIStore } from '@/stores/ui.store'

export function AppShell() {
  const sidebarOpen = useUIStore((s) => s.sidebarOpen)

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <PWAInstallBanner />
        <OfflineBanner />
        <main className="flex-1 overflow-hidden pb-16 md:pb-0">
          <Outlet />
        </main>
      </div>
      <BottomNav />
    </div>
  )
}