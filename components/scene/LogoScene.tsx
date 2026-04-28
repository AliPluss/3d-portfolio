'use client'

import {
  Suspense,
  Component,
  useEffect,
  useMemo,
  useRef,
  type ReactNode,
  type CSSProperties,
} from 'react'
import { Canvas, useFrame }  from '@react-three/fiber'
import { useGLTF, Center }   from '@react-three/drei'
import {
  Box3,
  Vector3,
  ACESFilmicToneMapping,
  Mesh,
  MeshStandardMaterial,
  Color,
} from 'three'
import type { DirectionalLight } from 'three'
import { clampedDpr }        from '@/lib/three-config'

/* ── Silent error boundary ────────────────────────────────────────────────── */
class ModelBoundary extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false }
  static getDerivedStateFromError() { return { failed: true } }
  render() { return this.state.failed ? null : this.props.children }
}

/* ── Mouse-reactive highlight ─────────────────────────────────────────────── */
function LightRig() {
  const ref    = useRef<DirectionalLight>(null)
  const cur    = useRef({ x: 0, y: 2 })
  const target = useRef({ x: 0, y: 2 })

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const nx =  (e.clientX / window.innerWidth)  * 2 - 1
      const ny = -(e.clientY / window.innerHeight) * 2 + 1
      target.current.x = nx * 1.4
      target.current.y = ny * 0.7 + 2.0
    }
    window.addEventListener('mousemove', handler, { passive: true })
    return () => window.removeEventListener('mousemove', handler)
  }, [])

  useFrame(() => {
    if (!ref.current) return
    // High smoothing — glacially slow drift
    const s = 0.018
    cur.current.x += (target.current.x - cur.current.x) * s
    cur.current.y += (target.current.y - cur.current.y) * s
    ref.current.position.set(cur.current.x, cur.current.y, 3)
  })

  return (
    <directionalLight
      ref={ref}
      position={[0, 2, 3]}
      intensity={0.14}
      color="#d4a84c"
    />
  )
}

/* ── Model ────────────────────────────────────────────────────────────────── */
function LogoModel() {
  const { scene } = useGLTF('/logo_avatar.glb')

  const autoScale = useMemo(() => {
    const box  = new Box3().setFromObject(scene)
    const size = box.getSize(new Vector3())
    const max  = Math.max(size.x, size.y, size.z)
    return max > 0 ? 1.8 / max : 1
  }, [scene])

  /*
   * Core fix: GLB files often embed MeshBasicMaterial which is unlit —
   * no light in the scene will affect it. Traverse every mesh and replace
   * any non-standard material with MeshStandardMaterial so the logo
   * actually responds to directional lights.
   *
   * If a mesh already uses MeshStandardMaterial/MeshPhysicalMaterial
   * (both instanceof MeshStandardMaterial), just tune roughness/metalness.
   */
  useEffect(() => {
    scene.traverse((child) => {
      if (!(child as Mesh).isMesh) return
      const mesh = child as Mesh
      const mats = Array.isArray(mesh.material)
        ? mesh.material
        : [mesh.material]

      mats.forEach((mat, idx) => {
        if (mat instanceof MeshStandardMaterial) {
          // Already lit — tune for a dark metallic/stone feel
          mat.roughness   = 0.60
          mat.metalness   = 0.35
          mat.needsUpdate = true
          return
        }

        // Unlit material — replace with a lit equivalent, preserving textures
        const stdMat = new MeshStandardMaterial({
          color:     (mat as any).color     ?? new Color(0x888888),
          map:       (mat as any).map       ?? null,
          normalMap: (mat as any).normalMap ?? null,
          roughness: 0.60,
          metalness: 0.35,
        })

        if (Array.isArray(mesh.material)) {
          ;(mesh.material as any)[idx] = stdMat
        } else {
          mesh.material = stdMat
        }
        mat.dispose()
      })
    })
  }, [scene])

  return (
    <Center>
      <primitive object={scene} scale={autoScale} />
    </Center>
  )
}

useGLTF.preload('/logo_avatar.glb')

/* ── Public component ────────────────────────────────────────────────────── */
interface LogoSceneProps {
  className?: string
  style?:     CSSProperties
}

export default function LogoScene({ className, style }: LogoSceneProps) {
  return (
    <ModelBoundary>
      <Canvas
        className={className}
        style={{ width: '100%', height: '100%', display: 'block', ...style }}
        dpr={[1, clampedDpr(2)]}
        frameloop="always"
        camera={{ fov: 40, near: 0.1, far: 100, position: [0, 0, 3] }}
        gl={{
          antialias:            true,
          alpha:                true,
          preserveDrawingBuffer: true,   // required: lets LogoParticles sample rendered pixels
          powerPreference:      'high-performance',
          toneMapping:          ACESFilmicToneMapping,
          toneMappingExposure:  1.0,
        }}
      >
        <Suspense fallback={null}>
          {/* Very low ambient — logo stays dark, shadows define the form */}
          <ambientLight intensity={0.08} />

          {/* Key — top-left, warm white, primary shaping light */}
          <directionalLight
            position={[-2, 4, 3]}
            intensity={1.3}
            color="#fff8f0"
          />

          {/* Warm fill — subtle reflected accent from below, not a main source */}
          <directionalLight
            position={[1, -1.5, 2]}
            intensity={0.18}
            color="#c9a84c"
          />

          {/* Rim — soft cool from behind, gentle silhouette edge */}
          <directionalLight
            position={[0, 1, -4]}
            intensity={0.55}
            color="#c8d0dc"
          />

          {/* Mouse-reactive warm highlight — high smoothing, barely perceptible */}
          <LightRig />

          <LogoModel />
        </Suspense>
      </Canvas>
    </ModelBoundary>
  )
}
