'use client'

import { motion, useScroll, useTransform } from 'framer-motion'

export function Parallax({
  children,
  speed = 0.08,
  className = '',
}: {
  children: React.ReactNode
  speed?: number
  className?: string
}) {
  const { scrollY } = useScroll()

  // Smooth controlled movement
  const y = useTransform(scrollY, [0, 1000], [0, -1000 * speed])

  return (
    <motion.div style={{ y }} className={className}>
      {children}
    </motion.div>
  )
}