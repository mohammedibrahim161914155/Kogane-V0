import * as React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { MessageSquare, Bot, Sparkles, User, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useUIStore } from '@/stores/ui.store'

const navItems = [
  { icon: MessageSquare, label: 'Chat', path: '/' },
  { icon: Bot, label: 'Agents', path: '/agents' },
  { icon: Sparkles, label: 'Skills', path: '/skills' },
  { icon: User, label: 'Personas', path: '/personas' },
  { icon: Settings, label: 'Settings', path: '/settings' },
]

export function BottomNav() {
  const navigate = useNavigate()
  const location = useLocation()
  const mobileTab = useUIStore((s) => s.mobileTab)
  const setMobileTab = useUIStore((s) => s.setMobileTab)

  const handleNav = (item: typeof navItems[0]) => {
    navigate(item.path)
    setMobileTab(item.path.slice(1) as any)
  }

  const currentPath = location.pathname === '/' ? '/' : `/${location.pathname.split('/')[1]}`

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border">
      <div className="grid grid-cols-5 h-16">
        {navItems.map((item) => {
          const isActive = currentPath === item.path
          const isCurrentTab = mobileTab === item.path.slice(1)

          return (
            <button
              key={item.path}
              onClick={() => handleNav(item)}
              className={cn(
                'flex flex-col items-center justify-center gap-1 transition-colors',
                isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <item.icon className={cn('h-5 w-5', isActive && 'text-primary')} />
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}