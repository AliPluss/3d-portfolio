'use client'

import { useEffect, useRef } from 'react'
import type * as THREE_TYPES from 'three'

// ─── Card data ───────────────────────────────────────────────────────────────
const CARD_DATA = [
  { img: '/Image1.png', title: 'ORIGIN',   subtitle: 'Mesopotamian Roots / Nordic Horizon' },
  { img: '/Image2.png', title: 'PRESENCE', subtitle: 'Calm Power / Silent Authority' },
  { img: '/Image3.png', title: 'VISION',   subtitle: 'Future Driven / Tech Focused' },
  { img: '/Image4.png', title: 'WORK',     subtitle: 'Selected Creations & Experiments' },
  { img: '/Image5.png', title: 'SIGNAL',   subtitle: 'Media, Content, Digital Voice' },
  { img: '/Image6.png', title: 'CONNECT',  subtitle: 'Reach, Network, Collaborate' },
]

// ─── Layout constants ────────────────────────────────────────────────────────
// Avatar lives on the LEFT  (~40% of viewport)
// Cards live on the RIGHT   (~60% of viewport)
//
// Camera at z=10, FOV=60 → screen half-width ≈ 10·tan(30°) ≈ 5.77 world units
// Screen center offset: lookat x=+0.5 shifts center slightly right
//   → avatar at x=-2.8 appears in left 40%
//   → active card at x=3.8 appears in right 60%
const AVATAR_X      = -2.8   // left side
const CARD_ACTIVE_X =  4.0   // right side, prominent
const CARD_GHOST_X  =  4.5   // slightly behind active
const CARD_FAR_X    =  14.0  // off-screen right (pending / exited)

// Total scroll height = (CARD_DATA.length + 1) panels × 100vh
// Panel 0        = intro (avatar lands, no cards)
// Panel 1–N      = one card per panel
const SCROLL_PANELS = CARD_DATA.length + 1

export default function ThreeScene() {
  const wrapperRef  = useRef<HTMLDivElement>(null)
  const stickyRef   = useRef<HTMLDivElement>(null)
  const webglRef    = useRef<HTMLDivElement>(null)
  const css3dRef    = useRef<HTMLDivElement>(null)
  const cleanupFn   = useRef<(() => void) | null>(null)

  useEffect(() => {
    if (!webglRef.current || !css3dRef.current || !wrapperRef.current) return
    if (cleanupFn.current) return   // StrictMode guard

    const webglContainer  = webglRef.current
    const css3dContainer  = css3dRef.current
    const wrapperEl       = wrapperRef.current

    let animFrameId: number
    let cardsReady = false

    ;(async () => {
      const THREE = await import('three')

      const { CSS3DRenderer, CSS3DObject } = await import(
        'three/addons/renderers/CSS3DRenderer.js'
      ) as typeof import('three/examples/jsm/renderers/CSS3DRenderer.js')

      const { GLTFLoader } = await import(
        'three/addons/loaders/GLTFLoader.js'
      ) as typeof import('three/examples/jsm/loaders/GLTFLoader.js')

      const { gsap }         = await import('gsap')
      const { ScrollTrigger } = await import('gsap/ScrollTrigger') as {
        ScrollTrigger: typeof import('gsap/ScrollTrigger').ScrollTrigger
      }
      gsap.registerPlugin(ScrollTrigger)

      // ── 1. Scene + Camera ─────────────────────────────────────────────────
      const scene = new THREE.Scene()
      scene.background = new THREE.Color('#050505')

      const W = () => window.innerWidth
      const H = () => window.innerHeight

      const camera = new THREE.PerspectiveCamera(60, W() / H(), 0.1, 1000)
      camera.position.set(0, 1.2, 10)
      camera.lookAt(0.5, 2, 0)   // slight right offset to leave room for cards

      // ── 2. Renderers ──────────────────────────────────────────────────────
      const webglRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
      webglRenderer.setSize(W(), H())
      webglRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
      webglContainer.appendChild(webglRenderer.domElement)

      const css3DRenderer = new CSS3DRenderer()
      css3DRenderer.setSize(W(), H())
      css3dContainer.appendChild(css3DRenderer.domElement)

      // ── 3. Lighting ───────────────────────────────────────────────────────
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.25)
      scene.add(ambientLight)

      const keyLight = new THREE.DirectionalLight(0xffffff, 1.8)
      keyLight.position.set(3, 8, 5)
      keyLight.castShadow = true
      keyLight.shadow.bias = -0.001
      scene.add(keyLight)

      const rimLight = new THREE.DirectionalLight(0xc8a84c, 1.6)   // warm gold rim
      rimLight.position.set(-6, 4, -8)
      scene.add(rimLight)

      const fillLight = new THREE.DirectionalLight(0xdcdcdc, 0.4)
      fillLight.position.set(5, 2, 4)
      scene.add(fillLight)

      // ── 4. Card state helpers ─────────────────────────────────────────────
      // offset = cardIndex - activeIndex
      //   0  = active card (front, right side)
      //  -1  = previous card (ghost 1, slightly behind)
      //  -2  = ghost 2 (very faint)
      //  >0  = future card (off-screen right)
      // <-2  = far past (off-screen right, exited)

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
            x: CARD_GHOST_X,
            y: 2.5 - GHOST_Y_STEP,
            z: 4.5 - GHOST_Z_STEP,
            opacity: 0.45, filter: 20,
            cardW: 360, cardH: 230,
            innerScale: 0.86, innerY: 0,
            boxShadow: 'inset 0 1px 0 rgba(201,168,76,0.1)',
          }
        }

        if (offset === -2) {
          return {
            x: CARD_GHOST_X + 0.3,
            y: 2.5 - GHOST_Y_STEP * 2,
            z: 4.5 - GHOST_Z_STEP * 2,
            opacity: 0.18, filter: 45,
            cardW: 270, cardH: 175,
            innerScale: 0.75, innerY: 0,
            boxShadow: 'none',
          }
        }

        // future or far past — off-screen
        return {
          x: CARD_FAR_X, y: 2.5, z: 4.5,
          opacity: 0, filter: 0,
          cardW: 480, cardH: 300,
          innerScale: 1, innerY: 0,
          boxShadow: 'none',
        }
      }

      // ── 5. Card objects ───────────────────────────────────────────────────
      const cssCards: InstanceType<typeof CSS3DObject>[] = []
      const cardEls:  HTMLDivElement[] = []
      let activeIndex = -1   // -1 = no card shown yet
      let isAnimating  = false

      function updateCardGeo(
        i: number,
        target: ReturnType<typeof getCardState>,
        tl: gsap.core.Timeline,
        startTime: number,
        dur = 0.85
      ) {
        const ease = 'cubic-bezier(0.16,1,0.3,1)'

        tl.to(cssCards[i].position, {
          x: target.x, y: target.y, z: target.z,
          duration: dur, ease,
        }, startTime)

        tl.to(cardEls[i], {
          width: target.cardW, height: target.cardH,
          opacity: target.opacity,
          boxShadow: target.boxShadow,
          duration: dur, ease,
          onUpdate() {
            cardEls[i].style.filter = `grayscale(${target.filter}%)`
            cardEls[i].style.pointerEvents = target.opacity > 0.05 ? 'auto' : 'none'
          },
        }, startTime)

        const scaler = cardEls[i].querySelector<HTMLElement>('.card-scaler')
        if (scaler) {
          tl.to(scaler, {
            scale: target.innerScale, y: target.innerY, x: 0,
            duration: dur, ease,
          }, startTime)
        }
      }

      // ── 6. Animate to a card index ────────────────────────────────────────
      function animateToCard(newIndex: number) {
        if (newIndex === activeIndex || isAnimating) return
        isAnimating = true

        const tl = gsap.timeline({ onComplete: () => { isAnimating = false } })
        const goingForward = newIndex > activeIndex

        // Stage 1: outgoing card transitions first
        if (goingForward) {
          // Current + all previously shown cards shift deeper into ghost stack
          for (let i = 0; i < newIndex; i++) {
            const offset = i - newIndex
            updateCardGeo(i, getCardState(offset), tl, 0, 0.75)
          }
          // New card comes in 0.25 s later (cinematic delay)
          updateCardGeo(newIndex, getCardState(0), tl, 0.25, 0.9)
          // Future cards remain off-screen
          for (let i = newIndex + 1; i < CARD_DATA.length; i++) {
            // already off-screen, no animation needed unless they drifted
            updateCardGeo(i, getCardState(i - newIndex), tl, 0, 0)
          }
        } else {
          // Going backward: new card enters from left ghost side to active
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
          scaler.innerHTML = `
            <img src="${data.img}" alt="${data.title}" loading="lazy" />
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

          // All cards start off-screen right
          const init = getCardState(index + 1) // all future
          cssObj.position.set(init.x, init.y, init.z)
          cssObj.scale.setScalar(0.01)

          el.style.width        = init.cardW + 'px'
          el.style.height       = init.cardH + 'px'
          el.style.opacity      = '0'
          el.style.pointerEvents = 'none'
          el.style.filter       = 'grayscale(0%)'
        })

        cardsReady = true
      }

      // ── 8. ScrollTrigger for card progression ─────────────────────────────
      function initScrollTrigger() {
        // Show first card immediately on mount
        animateToCard(0)

        ScrollTrigger.create({
          trigger: wrapperEl,
          start:   'top top',
          end:     'bottom bottom',
          onUpdate(self) {
            if (!cardsReady) return
            // Map scroll progress across CARD_DATA.length panels
            // Panel 0 → first card already shown at scroll=0
            // Panel 1 → card index 1 at scroll=(1/N)
            const idx = Math.min(
              Math.floor(self.progress * CARD_DATA.length),
              CARD_DATA.length - 1
            )
            if (idx !== activeIndex && !isAnimating) {
              animateToCard(idx)
            }
          },
        })
      }

      // ── 9. Load models ────────────────────────────────────────────────────
      const loader = new GLTFLoader()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const loadModel = (path: string): Promise<any> =>
        new Promise((res, rej) => loader.load(path, res, undefined, rej))

      try {
        const [rockGltf, avatarGltf] = await Promise.all([
          loadModel('/avatar2.glb'),
          loadModel('/avatar.glb'),
        ])

        // ── Rock ──────────────────────────────────────────────────────────
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
        rockBase.position.set(AVATAR_X, -2, 0)   // LEFT SIDE
        scene.add(rockBase)

        const afterRockBox = new THREE.Box3().setFromObject(rockBase)
        const rockTopY     = afterRockBox.max.y

        // ── Avatar ────────────────────────────────────────────────────────
        const avatar = avatarGltf.scene
        avatar.traverse((child: THREE_TYPES.Object3D) => {
          if ((child as THREE_TYPES.Mesh).isMesh) {
            ;(child as THREE_TYPES.Mesh).castShadow    = true
            ;(child as THREE_TYPES.Mesh).receiveShadow = true
          }
        })
        const avatarBox      = new THREE.Box3().setFromObject(avatar)
        const avatarSize     = avatarBox.getSize(new THREE.Vector3())
        const avatarScale    = 6.5 / Math.max(avatarSize.x, avatarSize.y, avatarSize.z)
        avatar.scale.setScalar(avatarScale)

        const afterAvatarBox  = new THREE.Box3().setFromObject(avatar)
        const avatarBottomOff = afterAvatarBox.min.y
        const landingY        = rockTopY - avatarBottomOff

        avatar.position.set(AVATAR_X, 15, 0)   // starts above, LEFT SIDE
        scene.add(avatar)

        // ── Landing sequence ──────────────────────────────────────────────
        const landTl = gsap.timeline()
        landTl.to(avatar.position, { y: landingY,        duration: 4.5, ease: 'power3.inOut' })
              .to(avatar.position, { y: landingY - 0.08, duration: 0.1, ease: 'power1.out' })
              .to(avatar.position, { y: landingY,         duration: 0.15,ease: 'power1.out' })
        landTl.to(ambientLight,   { intensity: '-=0.15', duration: 0.05, yoyo: true, repeat: 3 }, '-=0.25')
        landTl.add(() => {
          showCards()
          initScrollTrigger()
        }, '+=0.4')

      } catch (err) {
        console.error('[ThreeScene] Model load failed:', err)
        showCards()
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

      // ── 11. Render loop ───────────────────────────────────────────────────
      const animate = () => {
        animFrameId = requestAnimationFrame(animate)
        cssCards.forEach((card) => card.quaternion.copy(camera.quaternion))
        webglRenderer.render(scene, camera)
        css3DRenderer.render(scene, camera)
      }
      animate()

      // ── Cleanup ───────────────────────────────────────────────────────────
      cleanupFn.current = () => {
        cancelAnimationFrame(animFrameId)
        window.removeEventListener('resize', onResize)
        ScrollTrigger.getAll().forEach((t) => t.kill())
        gsap.killTweensOf('*')
        cssCards.forEach((c) => scene.remove(c))
        scene.clear()
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

  return (
    // Outer wrapper creates scroll space for ScrollTrigger
    <div
      ref={wrapperRef}
      style={{ height: `${SCROLL_PANELS * 100}vh`, position: 'relative' }}
    >
      {/* Sticky canvas — stays in viewport while user scrolls through panels */}
      <div
        ref={stickyRef}
        style={{
          position: 'sticky',
          top: 0,
          height: '100vh',
          overflow: 'hidden',
        }}
      >
        <div ref={webglRef} id="webgl-container" aria-hidden="true" />
        <div ref={css3dRef} id="css3d-container" aria-hidden="true" />

        {/* Hero text — visible in the first panel, left side */}
        <div
          className="hero-label"
          style={{
            position: 'absolute',
            left: '4vw',
            bottom: '8vh',
            zIndex: 5,
            pointerEvents: 'none',
          }}
        >
          <p style={{
            fontSize: '10px',
            letterSpacing: '0.25em',
            textTransform: 'uppercase',
            color: 'rgba(201,168,76,0.6)',
            marginBottom: '6px',
          }}>
            Creative Developer
          </p>
          <div style={{
            width: '32px',
            height: '1px',
            background: 'linear-gradient(90deg, #C9A84C, transparent)',
          }} />
        </div>

        {/* Scroll hint — right side, first panel */}
        <div
          style={{
            position: 'absolute',
            right: '2.5vw',
            bottom: '8vh',
            zIndex: 5,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '6px',
            pointerEvents: 'none',
          }}
        >
          <div style={{
            fontSize: '9px',
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.2)',
            writingMode: 'vertical-rl',
          }}>Scroll</div>
          <div style={{
            width: '1px',
            height: '48px',
            background: 'linear-gradient(to bottom, rgba(255,255,255,0.15), transparent)',
          }} />
        </div>
      </div>
    </div>
  )
}
