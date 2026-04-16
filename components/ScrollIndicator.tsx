'use client'

import { useEffect, useRef } from 'react'

export default function ScrollIndicator() {
  const lineRef = useRef<HTMLDivElement>(null)
  const dotRef  = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const LINE_H = 80 // px — the full height of the indicator track

    const update = () => {
      const scrolled = window.scrollY
      const total    = document.documentElement.scrollHeight - window.innerHeight
      const progress = total > 0 ? Math.min(scrolled / total, 1) : 0

      if (dotRef.current) {
        dotRef.current.style.top = `${progress * LINE_H}px`
      }
      if (lineRef.current) {
        // Filled portion grows downward
        lineRef.current.style.setProperty('--fill', `${progress * 100}%`)
      }
    }

    window.addEventListener('scroll', update, { passive: true })
    update()
    return () => window.removeEventListener('scroll', update)
  }, [])

  return (
    <div
      aria-hidden="true"
      style={{
        position: 'fixed',
        right: '22px',
        top:   '50%',
        transform: 'translateY(-50%)',
        zIndex: 40,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 0,
        pointerEvents: 'none',
      }}
    >
      {/* Track */}
      <div
        ref={lineRef}
        style={{
          width: '1px',
          height: '80px',
          background: 'rgba(255,255,255,0.08)',
          position: 'relative',
          borderRadius: '1px',
        }}
      >
        {/* Progress fill */}
        <div
          style={{
            position: 'absolute',
            top: 0, left: 0, right: 0,
            height: 'var(--fill, 0%)',
            background: 'linear-gradient(to bottom, #C9A84C, rgba(201,168,76,0.3))',
            borderRadius: '1px',
            transition: 'height 0.15s ease',
          }}
        />
        {/* Dot */}
        <div
          ref={dotRef}
          style={{
            position: 'absolute',
            top: 0,
            left: '50%',
            width: '5px',
            height: '5px',
            borderRadius: '50%',
            background: '#C9A84C',
            transform: 'translate(-50%, -50%)',
            boxShadow: '0 0 6px rgba(201,168,76,0.8)',
            transition: 'top 0.15s ease',
          }}
        />
      </div>
    </div>
  )
}
