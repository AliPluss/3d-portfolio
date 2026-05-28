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
import gsap from 'gsap'
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
  const group = useRef<any>()

  const autoScale = useMemo(() => {
    const box  = new Box3().setFromObject(scene)
    const size = box.getSize(new Vector3())
    const max  = Math.max(size.x, size.y, size.z)
    return max > 0 ? 1.8 / max : 1
  }, [scene])

  useEffect(() => {
    if (!group.current) return

    gsap.fromTo(
      group.current.scale,
      { x: 0.72, y: 0.72, z: 0.72 },
      { x: 1, y: 1, z: 1, duration: 1.25, ease: 'power3.out' },
    )
  }, [])

  useEffect(() => {
    scene.traverse((child) => {
      if (!(child as Mesh).isMesh) return
      const mesh = child as Mesh
      const mats = Array.isArray(mesh.material)
        ? mesh.material
        : [mesh.material]

      mats.forEach((mat, idx) => {
        if (mat instanceof MeshStandardMaterial) {
          mat.roughness   = 0.60
          mat.metalness   = 0.35
          mat.needsUpdate = true
          return
        }

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
    <group ref={group}>
      <Center>
        <primitive object={scene} scale={autoScale} />
      </Center>
    </group>
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
          preserveDrawingBuffer: true,
          powerPreference:      'high-performance',
          toneMapping:          ACESFilmicToneMapping,
          toneMappingExposure:  1.0,
        }}
      >
        <Suspense fallback={null}>
          <ambientLight intensity={0.08} />
          <directionalLight
            position={[-2, 4, 3]}
            intensity={1.3}
            color="#fff8f0"
          />
          <directionalLight
            position={[1, -1.5, 2]}
            intensity={0.18}
            color="#c9a84c"
          />
          <directionalLight
            position={[0, 1, -4]}
            intensity={0.55}
            color="#c8d0dc"
          />
          <LightRig />
          <LogoModel />
        </Suspense>
      </Canvas>
    </ModelBoundary>
  )
}
