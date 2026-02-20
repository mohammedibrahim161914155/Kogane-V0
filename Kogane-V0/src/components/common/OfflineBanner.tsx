import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { WifiOff } from 'lucide-react'
import { useUIStore } from '@/stores/ui.store'

export function OfflineBanner() {
  const isOnline = useUIStore((s) => s.isOnline)

  return (
    <AnimatePresence>
      {!isOnline && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="bg-yellow-600/20 border-b border-yellow-600/30 px-4 py-2 flex items-center gap-2"
        >
          <WifiOff className="h-4 w-4 text-yellow-400" />
          <span className="text-sm text-yellow-400">You're offline</span>
        </motion.div>
      )}
    </AnimatePresence>
  )
}