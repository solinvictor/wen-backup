'use client'

import { useRef, ReactNode } from 'react'
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion'

/**
 * Wraps a landing-page section so it physically hands off to the one
 * before/after it on scroll, instead of just sitting static once visible.
 *
 * As the section's top edge crosses the lower third of the viewport, it
 * eases up from a slight scale-down + blur into full focus.
 */
export default function SectionTransition({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  const reduceMotion = useReducedMotion()

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start 0.85', 'start 0.35'],
  })

  const scale = useTransform(scrollYProgress, [0, 1], [0.96, 1])
  const opacity = useTransform(scrollYProgress, [0, 1], [0, 1])
  const blur = useTransform(scrollYProgress, [0, 1], [6, 0])
  const filter = useTransform(blur, (v) => `blur(${v}px)`)

  if (reduceMotion) {
    return <>{children}</>
  }

  return (
    <motion.div ref={ref} style={{ scale, opacity, filter }}>
      {children}
    </motion.div>
  )
}
