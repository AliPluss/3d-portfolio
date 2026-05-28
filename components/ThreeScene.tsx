'use client'

import { useEffect, useRef, useState } from 'react'
import type * as THREE_TYPES from 'three'
import { cn } from '@/lib/utils'

// ─── Card data ────────────────────────────────────────────────────────────────
const CARD_DATA = [
  { img: '/Image1.png', title: 'ORIGIN',   subtitle: 'Mesopotamian Roots / Nordic Horizon' },
  { img: '/Image2.png', title: 'PRESENCE', subtitle: 'Calm Power / Silent Authority' },
  { img: '/Image3.png', title: 'VISION',   subtitle: 'Future Driven / Tech Focused' },
  { img: '/Image4.png', title: 'WORK',     subtitle: 'Selected Creations & Experiments' },
  { img: '/Image5.png', title: 'SIGNAL',   subtitle: 'Media, Content, Digital Voice' },
  { img: '/Image6.png', title: 'CONNECT',  subtitle: 'Reach, Network, Collaborate' },
]

// ─── Layout constants ─────────────────────────────────────────────────────────
const AVATAR_X      = -2.8   // left side
const CARD_ACTIVE_X =  4.0   // right side, prominent
const CARD_GHOST_X  =  4.5   // slightly behind active
const CARD_FAR_X    =  14.0  // off-screen right
const SCROLL_PANELS = CARD_DATA.length + 1

export default function ThreeScene() {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const stickyRef  = useRef<HTMLDivElement>(null)
  const webglRef   = useRef<HTMLDivElement>(null)
  const css3dRef   = useRef<HTMLDivElement>(null)
  const cleanupFn  = useRef<(() => void) | null>(null)
  const heroRef    = useRef<HTMLDivElement>(null)

  const [isMobile, setIsMobile] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [loadProgress, setLoadProgress] = useState(0)

  useEffect(() => {
    // Basic mobile check
    if (window.innerWidth < 768) {
      setIsMobile(true)
      setIsLoading(false)
      return
    }

    if (!webglRef.current || !css3dRef.current || !wrapperRef.current) return
    if (cleanupFn.current) return   // StrictMode guard

    const webglContainer = webglRef.current
    const css3dContainer = css3dRef.current
    const wrapperEl      = wrapperRef.current

    let animFrameId: number
    let cardsReady = false

    // ── Mouse state for cursor-reactive lighting ──────────────────────────────
    let mouseX = 0, mouseY = 0
    const onMouseMove = (e: MouseEvent) => {
      mouseX = (e.clientX  / window.innerWidth)  * 2 - 1   // −1 … +1
      mouseY = -(e.clientY / window.innerHeight) * 2 + 1   // −1 … +1 (Y flipped)
    }
    window.addEventListener('mousemove', onMouseMove, { passive: true })

    ;(async () => {
      const THREE = await import('three')

      const { CSS3DRenderer, CSS3DObject } = await import(
        'three/addons/renderers/CSS3DRenderer.js'
      ) as typeof import('three/examples/jsm/renderers/CSS3DRenderer.js')

      const { GLTFLoader } = await import(
        'three/addons/loaders/GLTFLoader.js'
      ) as typeof import('three/examples/jsm/loaders/GLTFLoader.js')

      const { gsap }          = await import('gsap')
      const { ScrollTrigger } = await import('gsap/ScrollTrigger') as {
        ScrollTrigger: typeof import('gsap/ScrollTrigger').ScrollTrigger
      }
      gsap.registerPlugin(ScrollTrigger)

      // ── 1. Scene + Camera ─────────────────────────────────────────────────
      const scene = new THREE.Scene()
      scene.background = new THREE.Color('#050505')

      const W = () => window.innerWidth
      const H = () => window.innerHeight

      // Slightly lower camera for heroic low-angle framing of the statue
      const camera = new THREE.PerspectiveCamera(60, W() / H(), 0.1, 1000)
      camera.position.set(0, 0.8, 10)
      camera.lookAt(0.5, 2.5, 0)

      // ── 2. Renderers ─────────────────────────────────────────────────────
      const webglRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
      webglRenderer.setSize(W(), H())
      webglRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
      // Shadow maps for contact shadow (statue feet on rock)
      webglRenderer.shadowMap.enabled    = true
      webglRenderer.shadowMap.type       = THREE.PCFSoftShadowMap
      // Filmic tone mapping for cinematic contrast
      webglRenderer.toneMapping          = THREE.ACESFilmicToneMapping
      webglRenderer.toneMappingExposure  = 1.05
      webglContainer.appendChild(webglRenderer.domElement)

      const css3DRenderer = new CSS3DRenderer()
      css3DRenderer.setSize(W(), H())
      css3dContainer.appendChild(css3DRenderer.domElement)

      // ── 3. Lighting ───────────────────────────────────────────────────────
      // Ambient — keep very low: dramatic shadows require high contrast base
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.15)
      scene.add(ambientLight)

      // Key light — top-front warm white, produces the contact shadow
      const keyLight = new THREE.DirectionalLight(0xfff5e8, 2.2)
      keyLight.position.set(3, 10, 5)
      keyLight.castShadow             = true
      keyLight.shadow.bias            = -0.0006
      keyLight.shadow.camera.near     = 0.5
      keyLight.shadow.camera.far      = 45
      keyLight.shadow.camera.left     = -8
      keyLight.shadow.camera.right    = 8
      keyLight.shadow.camera.top      = 14
      keyLight.shadow.camera.bottom   = -6
      keyLight.shadow.mapSize.width   = 2048
      keyLight.shadow.mapSize.height  = 2048
      scene.add(keyLight)

      // Rim light — gold from back-left, defines statue silhouette + halo edge
      const rimLight = new THREE.DirectionalLight(0xc9a84c, 3.2)
      rimLight.position.set(-7, 4, -9)
      scene.add(rimLight)

      // Secondary rim — cool blue from right-rear, adds edge depth separation
      const rimLight2 = new THREE.DirectionalLight(0x5580b8, 0.60)
      rimLight2.position.set(9, 2, -6)
      scene.add(rimLight2)

      // Fill light — subtle cool blue from front-right
      const fillLight = new THREE.DirectionalLight(0x7aaae0, 0.35)
      fillLight.position.set(5, 1, 6)
      scene.add(fillLight)

      // Bounce light — point light near rock surface, simulates light bouncing
      // upward from the rock onto the base of the statue
      const bounceLight = new THREE.PointLight(0xb08828, 1.4, 8)
      bounceLight.position.set(AVATAR_X, 0, 2.5)  // refined after model load
      scene.add(bounceLight)

      // Background atmosphere — deep blue-indigo behind statue for depth
      const bgAtmoLight = new THREE.PointLight(0x1e2d58, 4.0, 28)
      bgAtmoLight.position.set(AVATAR_X, 5, -9)
      scene.add(bgAtmoLight)

      // ── 4. Portal halo (canvas radial gradient on a plane) ────────────────
      // This creates the "light ring" signature visual behind the statue.
      // Canvas is used so we get a real radial gradient, not a flat colour.
      const haloCanvas = document.createElement('canvas')
      haloCanvas.width = haloCanvas.height = 512
      const haloCtx = haloCanvas.getContext('2d')!
      const hc = 256
      // Gradient: transparent center → faint inner → bright ring edge → transparent outer
      const hGrad = haloCtx.createRadialGradient(hc, hc, 44, hc, hc, 256)
      hGrad.addColorStop(0,    'rgba(201,168,76,0)')
      hGrad.addColorStop(0.46, 'rgba(201,168,76,0.008)')
      hGrad.addColorStop(0.68, 'rgba(201,168,76,0.065)')
      hGrad.addColorStop(0.80, 'rgba(201,168,76,0.26)')
      hGrad.addColorStop(0.88, 'rgba(201,168,76,0.10)')
      hGrad.addColorStop(1.0,  'rgba(201,168,76,0)')
      haloCtx.fillStyle = hGrad
      haloCtx.fillRect(0, 0, 512, 512)
      const haloTex = new THREE.CanvasTexture(haloCanvas)

      const haloMat = new THREE.MeshBasicMaterial({
        map:         haloTex,
        transparent: true,
        opacity:     0,          // fades in during landing
        depthWrite:  false,
        side:        THREE.DoubleSide,
      })
      const haloMesh = new THREE.Mesh(new THREE.PlaneGeometry(13, 13), haloMat)
      // Placeholder position — repositioned precisely after models load
      haloMesh.position.set(AVATAR_X, 5.5, -1.5)
      scene.add(haloMesh)

      // ── 5. Card state helpers ─────────────────────────────────────────────
      function getCardState(offset: number) {
        const GHOST_Y_STEP = 0.22
        const GHOST_Z_STEP = 0.65

        if (offset === 0) {
          return {
            x: CARD_ACTIVE_X, y: 2.5, z: 4.5,
            opacity: 1, filter: 0,
            cardW: 480, cardH: 300,
            innerScale: 1.04, innerY: 28,
            boxShadow: [
              '0 30px 70px rgba(0,0,0,0.55)',
              '0 0 50px rgba(201,168,76,0.12)',
              'inset 0 1px 0 rgba(201,168,76,0.22)',
            ].join(', '),
          }
        }
        if (offset === -1) {
          return {
            x: CARD_GHOST_X, y: 2.5 - GHOST_Y_STEP, z: 4.5 - GHOST_Z_STEP,
            opacity: 0.45, filter: 20,
            cardW: 360, cardH: 230,
            innerScale: 0.86, innerY: 0,
            boxShadow: 'inset 0 1px 0 rgba(201,168,76,0.10)',
          }
        }
        if (offset === -2) {
          return {
            x: CARD_GHOST_X + 0.3, y: 2.5 - GHOST_Y_STEP * 2, z: 4.5 - GHOST_Z_STEP * 2,
            opacity: 0.18, filter: 45,
            cardW: 270, cardH: 175,
            innerScale: 0.75, innerY: 0,
            boxShadow: 'none',
          }
        }
        return {
          x: CARD_FAR_X, y: 2.5, z: 4.5,
          opacity: 0, filter: 0,
          cardW: 480, cardH: 300,
          innerScale: 1, innerY: 0,
          boxShadow: 'none',
        }
      }

      // ── 6. Card animation helpers ─────────────────────────────────────────
      const cssCards: InstanceType<typeof CSS3DObject>[] = []
      const cardEls:  HTMLDivElement[] = []
      let activeIndex = -1
      let isAnimating = false

      function updateCardGeo(
        i: number,
        target: ReturnType<typeof getCardState>,
        tl: gsap.core.Timeline,
        startTime: number,
        dur = 0.85
      ) {
        const ease = 'cubic-bezier(0.16,1,0.3,1)'
        tl.to(cssCards[i].position, {
          x: target.x, y: target.y, z: target.z, duration: dur, ease,
        }, startTime)
        tl.to(cardEls[i], {
          width: target.cardW, height: target.cardH,
          opacity: target.opacity, boxShadow: target.boxShadow,
          duration: dur, ease,
          onUpdate() {
            cardEls[i].style.filter = `grayscale(${target.filter}%)`
            cardEls[i].style.pointerEvents = target.opacity > 0.05 ? 'auto' : 'none'
          },
        }, startTime)
        const scaler = cardEls[i].querySelector<HTMLElement>('.card-scaler')
        if (scaler) {
          tl.to(scaler, {
            scale: target.innerScale, y: target.innerY, x: 0, duration: dur, ease,
          }, startTime)
        }
      }

      function animateToCard(newIndex: number) {
        if (newIndex === activeIndex || isAnimating) return
        isAnimating = true
        const tl = gsap.timeline({ onComplete: () => { isAnimating = false } })
        const goingForward = newIndex > activeIndex
        if (goingForward) {
          for (let i = 0; i < newIndex; i++) {
            updateCardGeo(i, getCardState(i - newIndex), tl, 0, 0.75)
          }
          updateCardGeo(newIndex, getCardState(0), tl, 0.25, 0.9)
          for (let i = newIndex + 1; i < CARD_DATA.length; i++) {
            updateCardGeo(i, getCardState(i - newIndex), tl, 0, 0)
          }
        } else {
          for (let i = newIndex + 1; i < CARD_DATA.length; i++) {
            updateCardGeo(i, getCardState(i - newIndex), tl, 0, 0.75)
          }
          updateCardGeo(newIndex, getCardState(0), tl, 0.2, 0.9)
          for (let i = 0; i < newIndex; i++) {
            updateCardGeo(i, getCardState(i - newIndex), tl, 0, 0)
          }
        }
        activeIndex = newIndex
      }

      // ── 7. Create card DOM elements ───────────────────────────────────────
      function showCards() {
        CARD_DATA.forEach((data, index) => {
          const el = document.createElement('div')
          el.className = 'identity-card'

          const scaler = document.createElement('div')
          scaler.className = 'card-scaler'
          // Premium card layout: index eyebrow + rule, then image, then text
          scaler.innerHTML = `
            <div class="card-top-accent"></div>
            <div class="card-header">
              <span class="card-index">0${index + 1}</span>
              <div class="card-rule"></div>
            </div>
            <div class="card-image-wrap">
              <img src="${data.img}" alt="${data.title}" loading="lazy" />
              <div class="card-image-overlay"></div>
            </div>
            <div class="text-content">
              <h3>${data.title}</h3>
              <p class="subtitle">${data.subtitle}</p>
            </div>
          `
          el.appendChild(scaler)

          const cssObj = new CSS3DObject(el)
          scene.add(cssObj)
          cssCards.push(cssObj)
          cardEls.push(el)

          const init = getCardState(index + 1)  // all start off-screen
          cssObj.position.set(init.x, init.y, init.z)
          cssObj.scale.setScalar(0.01)

          el.style.width         = init.cardW + 'px'
          el.style.height        = init.cardH + 'px'
          el.style.opacity       = '0'
          el.style.pointerEvents = 'none'
          el.style.filter        = 'grayscale(0%)'
        })
        cardsReady = true
      }

      // ── 8. ScrollTrigger ─────────────────────────────────────────────────
      function initScrollTrigger() {
        animateToCard(0)
        ScrollTrigger.create({
          trigger: wrapperEl,
          start: 'top top', end: 'bottom bottom',
          onUpdate(self) {
            if (!cardsReady) return
            const idx = Math.min(
              Math.floor(self.progress * CARD_DATA.length),
              CARD_DATA.length - 1
            )
            if (idx !== activeIndex && !isAnimating) animateToCard(idx)
          },
        })
      }

      // ── 9. Load models ────────────────────────────────────────────────────
      const manager = new THREE.LoadingManager()
      manager.onProgress = (url, itemsLoaded, itemsTotal) => {
        setLoadProgress(Math.round((itemsLoaded / itemsTotal) * 100))
      }
      
      const loader = new GLTFLoader(manager)
      // Add DRACOLoader support for compressed GLBs (e.g., optimized assets)
      try {
        const { DRACOLoader } = await import('three/addons/loaders/DRACOLoader.js') as typeof import('three/examples/jsm/loaders/DRACOLoader.js')
        const dracoLoader = new DRACOLoader()
        // Use CDN hosted decoder – reliable across environments
        dracoLoader.setDecoderPath('https://www.gstatic.com/draco/v1/decoders/')
        loader.setDRACOLoader(dracoLoader)
      } catch (e) {
        console.warn('[ThreeScene] DRACOLoader not available, proceeding without.')
      }
      // Robust model loader: try optimized GLB first, fallback to original if it fails
      const loadModel = async (optPath: string, fallbackPath: string): Promise<any> => {
        try {
          return await new Promise((res, rej) => loader.load(optPath, res, undefined, rej))
        } catch (err) {
          console.warn('[ThreeScene] Optimized GLB failed, loading fallback:', fallbackPath, err)
          return await new Promise((res, rej) => loader.load(fallbackPath, res, undefined, rej))
        }
      }

      // Captured after model load so the cleanup fn (outside try) can kill its tweens
      let avatarForCleanup: THREE_TYPES.Object3D | null = null

      // Failsafe: If models take longer than 12 seconds or fail silently, unlock the screen
      const failsafeTimer = setTimeout(() => {
        setIsLoading(false)
        if (!cardsReady) {
          showCards()
          initScrollTrigger()
        }
      }, 12000)

      try {
        const [rockGltf, avatarGltf] = await Promise.all([
          loadModel('/avatar2.optimized.glb', '/avatar2.glb'),
          loadModel('/avatar.optimized.glb', '/avatar.glb'),
        ])

        // ── Rock ────────────────────────────────────────────────────────
        const rockBase = rockGltf.scene
        rockBase.traverse((child: THREE_TYPES.Object3D) => {
          if ((child as THREE_TYPES.Mesh).isMesh) {
            ;(child as THREE_TYPES.Mesh).receiveShadow = true
            ;(child as THREE_TYPES.Mesh).castShadow    = true
          }
        })
        const rockBox   = new THREE.Box3().setFromObject(rockBase)
        const rockSize  = rockBox.getSize(new THREE.Vector3())
        const rockScale = 12 / Math.max(rockSize.x, rockSize.z)
        rockBase.scale.setScalar(rockScale)
        rockBase.position.set(AVATAR_X, -2, 0)
        scene.add(rockBase)

        const afterRockBox = new THREE.Box3().setFromObject(rockBase)
        const rockTopY     = afterRockBox.max.y

        // ── Avatar ──────────────────────────────────────────────────────
        const avatar = avatarGltf.scene
        avatarForCleanup = avatar
        avatar.traverse((child: THREE_TYPES.Object3D) => {
          if ((child as THREE_TYPES.Mesh).isMesh) {
            ;(child as THREE_TYPES.Mesh).castShadow    = true
            ;(child as THREE_TYPES.Mesh).receiveShadow = true
          }
        })
        const avatarBox   = new THREE.Box3().setFromObject(avatar)
        const avatarSize  = avatarBox.getSize(new THREE.Vector3())
        const avatarScale = 6.5 / Math.max(avatarSize.x, avatarSize.y, avatarSize.z)
        avatar.scale.setScalar(avatarScale)

        const afterAvatarBox  = new THREE.Box3().setFromObject(avatar)
        const avatarBottomOff = afterAvatarBox.min.y
        const landingY        = rockTopY - avatarBottomOff

        // Place halo at ~65% of avatar height from feet — chest/shoulder level
        const avatarWorldH = afterAvatarBox.max.y - afterAvatarBox.min.y
        const haloY = landingY + afterAvatarBox.min.y + avatarWorldH * 0.65
        haloMesh.position.set(AVATAR_X, haloY, -1.5)

        // Refine bounce light to sit just above rock surface
        bounceLight.position.set(AVATAR_X, rockTopY + 0.4, 2.2)

        avatar.position.set(AVATAR_X, 15, 0)   // starts above viewport
        scene.add(avatar)

        // ── Landing sequence ────────────────────────────────────────────
        const landTl = gsap.timeline()
        // Avatar descends
        landTl.to(avatar.position, { y: landingY,        duration: 4.5, ease: 'power3.inOut' })
              .to(avatar.position, { y: landingY - 0.08, duration: 0.1, ease: 'power1.out'   })
              .to(avatar.position, { y: landingY,        duration: 0.15, ease: 'power1.out'  })
        // Light flicker on impact
        landTl.to(ambientLight, { intensity: '-=0.1', duration: 0.05, yoyo: true, repeat: 3 }, '-=0.25')
        // Portal halo fades in as avatar approaches
        landTl.to(haloMat, { opacity: 1.0, duration: 2.0, ease: 'power2.out' }, '-=2.2')

        // Hero identity fades in while avatar descends — text manifests with the figure
        const heroEl = heroRef.current
        if (heroEl) {
          landTl.fromTo(
            heroEl,
            { opacity: 0, y: 20 },
            { opacity: 1, y: 0, duration: 1.5, ease: 'power2.out' },
            3.0   // absolute time: starts 3s into the descent
          )
        }

        // After landing: start idle animations + cards
        landTl.add(() => {
          clearTimeout(failsafeTimer)
          setIsLoading(false) // Models loaded and landed
          if (!cardsReady) showCards()
          initScrollTrigger()

          // Idle breathing — gentle vertical float (like slow inhale/exhale)
          gsap.to(avatar.position, {
            y: landingY - 0.13,
            duration: 3.8,
            ease: 'sine.inOut',
            repeat: -1,
            yoyo: true,
            delay: 0.4,
          })

          // Micro-sway — very subtle rotational breathing
          gsap.to(avatar.rotation, {
            y: 0.03,
            duration: 6.5,
            ease: 'sine.inOut',
            repeat: -1,
            yoyo: true,
          })

          // Halo pulse — gently breathes between two opacity levels
          gsap.to(haloMat, {
            opacity: 0.72,
            duration: 4.5,
            ease: 'sine.inOut',
            repeat: -1,
            yoyo: true,
          })

          // Bounce light pulse — simulates ambient movement from rock surface
          gsap.to(bounceLight, {
            intensity: 0.5,
            duration: 3.8,
            ease: 'sine.inOut',
            repeat: -1,
            yoyo: true,
            delay: 1.8,
          })

          // Background atmosphere drifts very slowly side-to-side
          gsap.to(bgAtmoLight.position, {
            x: AVATAR_X + 1.5,
            duration: 10,
            ease: 'sine.inOut',
            repeat: -1,
            yoyo: true,
          })
        }, '+=0.4')

      } catch (err) {
        clearTimeout(failsafeTimer)
        setIsLoading(false)
        console.error('[ThreeScene] Model load failed:', err)
        // Immediately reveal hero text if models fail to load
        const heroEl = heroRef.current
        if (heroEl) {
          gsap.fromTo(heroEl,
            { opacity: 0, y: 20 },
            { opacity: 1, y: 0, duration: 0.9, ease: 'power2.out', delay: 0.3 }
          )
        }
        if (!cardsReady) showCards()
        initScrollTrigger()
      }

      // ── 10. Resize ────────────────────────────────────────────────────────
      const onResize = () => {
        camera.aspect = W() / H()
        camera.updateProjectionMatrix()
        webglRenderer.setSize(W(), H())
        css3DRenderer.setSize(W(), H())
        ScrollTrigger.refresh()
      }
      window.addEventListener('resize', onResize)

      // ── 11. Render loop — cursor-reactive lighting ────────────────────────
      // Smooth interpolation targets (avoid snapping)
      let kx = keyLight.position.x
      let ky = keyLight.position.y
      let rx = rimLight.position.x

      const animate = () => {
        animFrameId = requestAnimationFrame(animate)

        // Key light drifts with cursor (±1.4 world units), lerp 2.5%/frame
        kx += (3.0 + mouseX * 1.4 - kx) * 0.025
        ky += (10.0 + mouseY * 0.7 - ky) * 0.025
        keyLight.position.x = kx
        keyLight.position.y = ky

        // Rim light opposes key very subtly — deepens silhouette on cursor drag
        rx += (-6.0 + mouseX * -0.6 - rx) * 0.018
        rimLight.position.x = rx

        cssCards.forEach((card) => card.quaternion.copy(camera.quaternion))
        webglRenderer.render(scene, camera)
        css3DRenderer.render(scene, camera)
      }
      animate()

      // ── Cleanup ───────────────────────────────────────────────────────────
      cleanupFn.current = () => {
        clearTimeout(failsafeTimer)
        cancelAnimationFrame(animFrameId)
        window.removeEventListener('resize',    onResize)
        window.removeEventListener('mousemove', onMouseMove)
        ScrollTrigger.getAll().forEach(t => t.kill())

        // Kill tweens on known scene objects only.
        // gsap.killTweensOf('*') would also kill running page-transition shards.
        if (avatarForCleanup) {
          gsap.killTweensOf(avatarForCleanup.position)
          gsap.killTweensOf(avatarForCleanup.rotation)
        }
        gsap.killTweensOf(haloMat)
        gsap.killTweensOf(bounceLight)
        gsap.killTweensOf(bgAtmoLight.position)
        gsap.killTweensOf(ambientLight)
        if (heroRef.current) gsap.killTweensOf(heroRef.current)
        cssCards.forEach(c => gsap.killTweensOf(c.position))
        cardEls.forEach(el => {
          gsap.killTweensOf(el)
          const s = el.querySelector('.card-scaler')
          if (s) gsap.killTweensOf(s)
        })

        cssCards.forEach(c => scene.remove(c))
        scene.clear()

        // Dispose GPU resources
        haloTex.dispose()
        haloMesh.geometry.dispose()
        haloMat.dispose()

        if (webglContainer.contains(webglRenderer.domElement))
          webglContainer.removeChild(webglRenderer.domElement)
        if (css3dContainer.contains(css3DRenderer.domElement))
          css3dContainer.removeChild(css3DRenderer.domElement)
        webglRenderer.dispose()
      }
    })()

    return () => {
      cleanupFn.current?.()
      cleanupFn.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (isMobile) {
    return (
      <div style={{ height: '100vh', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'flex-start', padding: '0 6vw', overflow: 'hidden' }}>
        {/* Premium CSS Fallback Background */}
        <div aria-hidden className="absolute inset-0 bg-[#050505]">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(201,168,76,0.12),transparent_60%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(20,30,62,0.40),transparent_70%)]" />
          {/* Subtle noise texture */}
          <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }} />
        </div>

        {/* Hero Identity Block (Static) */}
        <div className="relative z-10 max-w-lg mt-12">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-6 h-px bg-gold/70" />
            <span className="font-inter text-[9px] font-medium tracking-[0.38em] uppercase text-gold/70">
              Creative Developer & Designer
            </span>
          </div>

          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold text-white leading-[1.05] tracking-tight mb-5" style={{ fontFamily: "'Playfair Display', serif" }}>
            Design at<br />
            <em className="italic font-normal text-gold">full depth.</em>
          </h1>

          <p className="font-inter text-[12px] text-white/40 leading-relaxed tracking-wider mb-8">
            Three.js &nbsp;·&nbsp; GSAP &nbsp;·&nbsp; React &nbsp;·&nbsp; Next.js
          </p>

          <div className="w-10 h-px bg-gradient-to-r from-gold/80 to-transparent" />
        </div>

        {/* Bottom scroll hint */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 opacity-60">
          <span className="font-inter text-[8px] font-medium tracking-[0.28em] uppercase text-white/40" style={{ writingMode: 'vertical-rl' }}>
            Explore
          </span>
          <div className="w-px h-12 bg-white/10 relative overflow-hidden rounded-full">
            <div className="absolute top-0 inset-x-0 h-[40%] bg-gradient-to-b from-gold to-transparent rounded-full animate-[scroll-hint-drop_2.4s_cubic-bezier(0.4,0,0.2,1)_infinite]" />
          </div>
        </div>
      </div>
    )
  }

  return (
    // Outer wrapper creates the scroll space for ScrollTrigger panels
    <div ref={wrapperRef} style={{ height: `${SCROLL_PANELS * 100}vh`, position: 'relative' }}>
      
      {/* ── Premium Loading Overlay ── */}
      <div 
        className={cn(
          'fixed inset-0 z-40 bg-[#050505] flex flex-col items-center justify-center transition-all duration-[1200ms] ease-in-out',
          isLoading ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        )}
      >
        <div className="flex flex-col items-center gap-6">
          {/* Rotating gold ring */}
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 rounded-full border border-white/5" />
            <div className="absolute inset-0 rounded-full border-t border-gold animate-spin" style={{ animationDuration: '1.5s' }} />
            {/* Center percentage */}
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="font-inter text-[10px] font-medium tracking-[0.1em] text-white/60">
                {loadProgress}%
              </span>
            </div>
          </div>
          <span className="font-inter text-[9px] font-medium tracking-[0.3em] uppercase text-gold/40">
            Initializing WebGL
          </span>
        </div>
      </div>

      {/* Sticky canvas — stays in viewport as user scrolls through panels */}
      <div
        ref={stickyRef}
        style={{ position: 'sticky', top: 0, height: '100vh', overflow: 'hidden' }}
      >
        {/* ── Atmospheric background glow — slow drift, behind 3D scene ── */}
        <div
          aria-hidden="true"
          style={{
            position:   'absolute',
            inset:      0,
            zIndex:     0,
            background: [
              // Deep blue-indigo behind statue — depth and atmosphere
              'radial-gradient(ellipse 54% 68% at 37% 50%, rgba(20,30,62,0.50) 0%, transparent 72%)',
              // Subtle warm gold glow near rock base
              'radial-gradient(ellipse 28% 22% at 38% 68%, rgba(201,168,76,0.045) 0%, transparent 60%)',
            ].join(', '),
            animation:  'hero-glow-drift 10s ease-in-out infinite',
            pointerEvents: 'none',
          }}
        />

        <div ref={webglRef} id="webgl-container" aria-hidden="true" />
        <div ref={css3dRef} id="css3d-container" aria-hidden="true" />

        {/* ── Cinematic vignette — frames the scene, lighter on left to not crush hero text ── */}
        <div
          aria-hidden="true"
          style={{
            position:      'absolute',
            inset:         0,
            zIndex:        3,
            background: [
              'radial-gradient(ellipse 90% 84% at 42% 50%, transparent 28%, rgba(5,5,5,0.72) 100%)',
              'linear-gradient(to right, rgba(5,5,5,0.22) 0%, transparent 40%)',
            ].join(', '),
            pointerEvents: 'none',
          }}
        />

        {/* ── Top gradient — ensures navbar text stays legible ── */}
        <div
          aria-hidden="true"
          style={{
            position:      'absolute',
            top:           0, left: 0, right: 0,
            height:        '140px',
            zIndex:        4,
            background:    'linear-gradient(to bottom, rgba(5,5,5,0.60), transparent)',
            pointerEvents: 'none',
          }}
        />

        {/* ── Bottom gradient — grounds the scene ── */}
        <div
          aria-hidden="true"
          style={{
            position:      'absolute',
            bottom:        0, left: 0, right: 0,
            height:        '180px',
            zIndex:        4,
            background:    'linear-gradient(to top, rgba(5,5,5,0.70), transparent)',
            pointerEvents: 'none',
          }}
        />

        {/* ── Hero identity block — anchored bottom-left ── */}
        <div
          ref={heroRef}
          style={{
            position:      'absolute',
            left:          '5vw',
            bottom:        '13vh',
            zIndex:        5,
            pointerEvents: 'none',
            opacity:       0,   // GSAP animates this in during the landing sequence
          }}
        >
          {/* Eyebrow with side rule */}
          <div style={{
            display:      'flex',
            alignItems:   'center',
            gap:          '14px',
            marginBottom: '20px',
          }}>
            <div style={{
              width: '22px', height: '1px', flexShrink: 0,
              background: 'rgba(201,168,76,0.72)',
            }} />
            <span style={{
              fontFamily:    'Inter, sans-serif',
              fontSize:      '9px',
              fontWeight:    500,
              letterSpacing: '0.38em',
              textTransform: 'uppercase',
              color:         'rgba(201,168,76,0.68)',
            }}>
              Creative Developer &amp; Designer
            </span>
          </div>

          {/* Large display title */}
          <h1 style={{
            fontFamily:    "'Playfair Display', serif",
            fontSize:      'clamp(40px, 4.6vw, 70px)',
            fontWeight:    700,
            lineHeight:    1.02,
            letterSpacing: '-0.022em',
            color:         '#ffffff',
            margin:        0,
            marginBottom:  '16px',
          }}>
            Design at<br />
            <em style={{ fontStyle: 'italic', color: 'var(--gold)' }}>full depth.</em>
          </h1>

          {/* Tech stack descriptor */}
          <p style={{
            fontFamily:    'Inter, sans-serif',
            fontSize:      '11px',
            color:         'rgba(255,255,255,0.32)',
            lineHeight:    1.7,
            margin:        0,
            marginBottom:  '22px',
            letterSpacing: '0.04em',
          }}>
            Three.js &nbsp;·&nbsp; GSAP &nbsp;·&nbsp; React &nbsp;·&nbsp; Next.js
          </p>

          {/* Closing gold rule */}
          <div style={{
            width:      '32px',
            height:     '1px',
            background: 'linear-gradient(90deg, rgba(201,168,76,0.80), transparent)',
          }} />
        </div>

        {/* ── Scroll hint — bottom right ── */}
        <div
          style={{
            position:      'absolute',
            right:         '3vw',
            bottom:        '9vh',
            zIndex:        5,
            display:       'flex',
            flexDirection: 'column',
            alignItems:    'center',
            gap:           '10px',
            pointerEvents: 'none',
          }}
        >
          <span style={{
            fontFamily:    'Inter, sans-serif',
            fontSize:      '8px',
            fontWeight:    400,
            letterSpacing: '0.28em',
            textTransform: 'uppercase',
            color:         'rgba(255,255,255,0.18)',
            writingMode:   'vertical-rl',
          }}>
            Explore
          </span>
          <div style={{
            width:        '1px',
            height:       '52px',
            position:     'relative',
            background:   'rgba(255,255,255,0.08)',
            borderRadius: '1px',
            overflow:     'hidden',
          }}>
            {/* Animated fill line */}
            <div style={{
              position:    'absolute',
              top:         0,
              left:        0,
              right:       0,
              height:      '40%',
              background:  'linear-gradient(to bottom, var(--gold), transparent)',
              animation:   'scroll-hint-drop 2.4s cubic-bezier(0.4,0,0.2,1) infinite',
              borderRadius:'1px',
            }} />
          </div>
        </div>
      </div>
    </div>
  )
}
