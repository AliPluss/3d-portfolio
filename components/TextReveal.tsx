'use client'

import { useRef } from 'react'
import { motion, useInView, Variants } from 'framer-motion'

interface TextRevealProps {
  text: string
  className?: string
  delay?: number
  duration?: number
  stagger?: number
  type?: 'words' | 'lines' | 'fade-up'
}

export default function TextReveal({
  text,
  className = '',
  delay = 0,
  duration = 0.8,
  stagger = 0.04,
  type = 'words',
}: TextRevealProps) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-10% 0px' })

  if (type === 'fade-up') {
    return (
      <div ref={ref} className={className}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration, delay, ease: [0.16, 1, 0.3, 1] }}
        >
          {text}
        </motion.div>
      </div>
    )
  }

  // Word by word stagger
  const words = text.split(' ')

  const container: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: stagger, delayChildren: delay },
    },
  }

  const child: Variants = {
    hidden: { opacity: 0, y: '100%', rotate: 2 },
    visible: {
      opacity: 1,
      y: '0%',
      rotate: 0,
      transition: { duration, ease: [0.16, 1, 0.3, 1] },
    },
  }

  return (
    <div ref={ref} className={`${className} flex flex-wrap`}>
      <motion.div
        variants={container}
        initial="hidden"
        animate={isInView ? 'visible' : 'hidden'}
        className="flex flex-wrap"
      >
        {words.map((word, i) => (
          <div key={i} className="overflow-hidden pb-1 mr-[0.25em]">
            <motion.div variants={child} className="inline-block">
              {word}
            </motion.div>
          </div>
        ))}
      </motion.div>
    </div>
  )
}
