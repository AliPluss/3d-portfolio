'use client'

/**
 * SceneCanvas — lightweight R3F Canvas wrapper with the project's
 * standard renderer settings and camera config baked in.
 *
 * Use this instead of <Canvas> directly to guarantee consistency
 * across any future R3F scene in the project.
 *
 * The existing homepage ThreeScene is imperative (plain Three.js + CSS3DRenderer)
 * and is not replaced here. This wrapper is for future R3F-based scenes.
 */

import { Suspense, type ReactNode } from 'react'
import { Canvas }         from '@react-three/fiber'
import { cameraConfig, clampedDpr } from '@/lib/three-config'

interface SceneCanvasProps {
  children:       ReactNode
  className?:     string
  style?:         React.CSSProperties
  /** Override default camera FOV */
  fov?:           number
  /** Capture pointer events (false for background scenes) */
  eventSource?:   React.MutableRefObject<HTMLElement>
  frameloop?:     'always' | 'demand' | 'never'
}

export default function SceneCanvas({
  children,
  className,
  style,
  fov      = cameraConfig.fov,
  eventSource,
  frameloop = 'always',
}: SceneCanvasProps) {
  return (
    <Canvas
      className={className}
      style={style}
      frameloop={frameloop}
      dpr={[1, clampedDpr(2)]}
      camera={{
        fov,
        near:     cameraConfig.near,
        far:      cameraConfig.far,
        position: cameraConfig.position,
      }}
      gl={{
        antialias:        true,
        alpha:            true,
        powerPreference:  'high-performance',
        preserveDrawingBuffer: false,
      }}
      onCreated={({ gl }) => {
        // Apply post-creation settings synchronously
        // (applyRendererSettings is async so we inline the sync-safe parts)
        import('three').then(THREE => {
          gl.outputColorSpace    = THREE.SRGBColorSpace
          gl.toneMapping         = THREE.ACESFilmicToneMapping
          gl.toneMappingExposure = 1.2
          gl.shadowMap.enabled   = true
          gl.shadowMap.type      = THREE.PCFSoftShadowMap
        })
      }}
      {...(eventSource ? { eventSource } : {})}
    >
      <Suspense fallback={null}>
        {children}
      </Suspense>
    </Canvas>
  )
}
