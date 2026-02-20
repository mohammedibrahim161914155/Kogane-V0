import * as React from 'react'
import { motion } from 'framer-motion'

export function StreamingCursor() {
  return (
    <motion.span
      className="inline-block text-primary ml-0.5"
      animate={{ opacity: [1, 0, 1] }}
      transition={{ duration: 1, repeat: Infinity, ease: 'step-end' }}
    >
      ▋
    </motion.span>
  )
}