# CLAUDE.md — 3D Portfolio Project

> **Status: In Progress** — Architecture is largely migrated to Next.js 14, but several features are still incomplete. Read this file before touching any code.

---

## Project Overview

A cinematic 3D portfolio site for a creative developer. The core visual is an avatar statue that descends from above onto a rock pedestal, lit dramatically with a gold halo ring behind it. As the user scrolls, CSS3D identity cards animate in from the right. Below the 3D hero, a standard dark-themed work section shows projects.

**Live stack:** Next.js 14 (App Router) · Three.js (imperative, not R3F) · GSAP + ScrollTrigger · Lenis smooth scroll · Framer Motion · Tailwind CSS · shadcn/ui · Node.js/Express backend · MongoDB

---

## Repository Structure

```
/
├── app/                        # Next.js App Router pages
│   ├── page.tsx                # Home: ThreeScene + HomeWorkSection + LogoParticles
│   ├── layout.tsx              # Root layout, Navbar, providers, global CSS
│   ├── globals.css             # All CSS variables, card styles, animations
│   ├── projects/page.tsx       # All projects grid
│   ├── blog/page.tsx           # Blog listing
│   ├── cv/page.tsx             # CV / Resume page
│   └── admin/
│       ├── page.tsx            # JWT login form
│       └── dashboard/page.tsx  # Protected upload dashboard
│
├── components/
│   ├── ThreeScene.tsx          # ★ CORE — entire 3D hero (WebGL + CSS3D + GSAP)
│   ├── HomeWorkSection.tsx     # Work section below hero
│   ├── Navbar.tsx              # Fixed top bar with LogoScene
│   ├── LogoParticles.tsx       # Particle migration effect (hero → work section)
│   ├── MigrationController.tsx # ScrollTrigger context for particle migration
│   ├── DenseOrb.tsx            # Animated orb in work section left column
│   ├── ProjectCard.tsx         # featured / grid variants
│   ├── BlogCard.tsx            # Blog post card
│   ├── CustomCursor.tsx        # Custom cursor (cursor: none on all links)
│   ├── PageShell.tsx           # Wrapper with page-enter animation
│   ├── PageTransitionOverlay.tsx  # Full-screen shard transition overlay
│   ├── TransitionLink.tsx      # <Link> that triggers page transition before navigate
│   ├── ScrollIndicator.tsx     # Scroll progress bar
│   ├── scene/
│   │   ├── LogoScene.tsx       # R3F canvas for logo_avatar.glb in navbar
│   │   ├── SceneCanvas.tsx     # Shared R3F canvas wrapper
│   │   └── SceneLighting.tsx   # Shared R3F lighting setup
│   ├── motion/
│   │   ├── ScrollReveal.tsx    # IntersectionObserver reveal wrapper
│   │   └── ParallaxLayer.tsx   # CSS parallax helper
│   ├── providers/
│   │   ├── LenisProvider.tsx   # Lenis smooth scroll init
│   │   ├── PostHogProvider.tsx # Analytics
│   │   └── index.tsx           # Barrel: wraps all providers
│   └── ui/                     # shadcn/ui components (button, card, badge, etc.)
│
├── lib/
│   ├── design-tokens.ts        # JS mirrors of CSS variables (for Three.js / GSAP)
│   ├── three-config.ts         # Renderer settings, camera defaults, scene colors
│   ├── motion-config.ts        # Framer Motion transition presets
│   ├── migration-context.tsx   # React context for particle migration state
│   ├── analytics.ts            # PostHog helpers
│   ├── cloudinary.ts           # Image upload helpers (Cloudinary SDK)
│   ├── mongodb.ts              # Mongoose connection singleton
│   └── utils.ts                # cn() and misc utilities
│
├── server/                     # Standalone Express API
│   ├── index.js                # Entry point, MongoDB connect, routes
│   ├── middleware/auth.js       # JWT verify middleware
│   ├── models/
│   │   ├── User.js
│   │   ├── Project.js
│   │   └── Post.js
│   └── routes/
│       ├── auth.js             # POST /api/auth/login, /register
│       ├── projects.js         # CRUD /api/projects
│       └── posts.js            # CRUD /api/posts
│
└── public/
    ├── avatar.glb              # Main statue model (hero scene)
    ├── avatar2.glb             # Rock/pedestal model
    ├── logo_avatar.glb         # Small logo model (navbar)
    ├── Image1–6.png            # Card background images (ORIGIN → CONNECT)
    ├── favicon.svg
    └── icons.svg
```

---

## Core Architecture: ThreeScene.tsx

This is the most complex file. **Do not refactor it without understanding the full flow.**

### Rendering pipeline

Two renderers run simultaneously and share the same `<canvas>` z-stack:
- `WebGLRenderer` — renders the 3D scene (statue, rock, lights, halo) at `zIndex: 1`
- `CSS3DRenderer` — renders HTML identity cards as CSS3D objects at `zIndex: 2`

Both are mounted imperatively in `useEffect` because CSS3DRenderer cannot be used with React Three Fiber's reconciler.

### Scroll system

```
wrapperDiv (height: 7 × 100vh)  ← ScrollTrigger pin target
  └── stickyDiv (position: sticky, height: 100vh)
        ├── webglContainer
        ├── css3dContainer
        └── heroRef (text overlay, fades in during avatar landing)
```

`SCROLL_PANELS = CARD_DATA.length + 1 = 7` — each panel is 100vh. ScrollTrigger maps `progress 0→1` across 7 panels to `cardIndex 0→5`.

### Avatar landing sequence (GSAP timeline)

1. Avatar starts at `y: 15` (above viewport)
2. Descends to `landingY` over 4.5s with `power3.inOut`
3. Small bounce on impact (−0.08 → 0 over 0.25s)
4. Light flicker (`ambientLight` yoyo × 3)
5. Halo fades in (opacity 0 → 1 over 2s, starting 2.2s before landing)
6. Hero text fades in at t=3.0s
7. On complete: `showCards()` + `initScrollTrigger()` + idle animations start

### Lighting rig (7 lights)

| Light | Color | Role |
|---|---|---|
| `ambientLight` | white @ 0.15 | Minimal base fill |
| `keyLight` | warm white @ 2.2 | Main + contact shadow, cursor-reactive |
| `rimLight` | gold @ 3.2 | Signature silhouette edge from back-left |
| `rimLight2` | cool blue @ 0.60 | Right-rear edge depth |
| `fillLight` | blue @ 0.35 | Front-right soft fill |
| `bounceLight` | warm gold PointLight | Simulates rock surface bounce |
| `bgAtmoLight` | deep blue PointLight | Background atmospheric depth |

`keyLight` and `rimLight` positions react to mouse movement via lerp in the render loop.

### Card state system

6 CSS3D cards exist at all times. Each card has an `offset` from the active card:
- `offset 0` → active (large, front, full opacity)
- `offset -1` → ghost behind (smaller, blurred, 45% opacity)
- `offset -2` → distant ghost (even smaller, 18% opacity)
- `offset < -2` or positive → off-screen right at `x: 14.0`

`animateToCard(index)` builds a GSAP timeline animating all 6 cards simultaneously.

---

## Design System

### CSS Variables (defined in `globals.css`)

```css
--gold: #C9A84C          /* Primary accent */
--gold-border: rgba(201,168,76,0.20)
--bg: #050505            /* Near-black background */
--text-muted: rgba(255,255,255,0.48)
--border: rgba(255,255,255,0.072)
--radius: 16px
```

**Always use these variables.** Never hardcode `#C9A84C` in new components — use `var(--gold)`.

JS equivalents live in `lib/design-tokens.ts` for Three.js and GSAP inline styles.

### Typography

- **Display / headings:** Playfair Display (serif) — `font-family: 'Playfair Display', serif`
- **UI / body:** Inter (sans-serif)
- Eyebrow labels: 9px, `letter-spacing: 0.38em`, `text-transform: uppercase`
- Section labels: use `.section-label` class from globals.css

### Color philosophy

Dark base (`#050505`), single gold accent (`#C9A84C`), cool blue secondary. Everything else is white at varying opacities. No colored backgrounds — depth comes from gradients and lighting.

---

## Page Transitions

`TransitionLink` wraps Next.js `<Link>`. Clicking it:
1. Triggers `PageTransitionOverlay` (shard animation, ~600ms)
2. Then navigates

All interactive elements use `cursor: none` — `CustomCursor` renders the custom cursor.

**Do not use plain `<Link>` or `<a>` for internal navigation.** Always use `TransitionLink`.

---

## Backend (Express + MongoDB)

The Express server (`server/`) runs separately from Next.js on port 5000.

```bash
npm run dev       # Next.js only (port 3000)
npm run server    # Express only (port 5000)
npm run dev:all   # Both concurrently
```

### API Routes

```
POST   /api/auth/login
POST   /api/auth/register
GET    /api/projects
POST   /api/projects      (auth required)
PUT    /api/projects/:id  (auth required)
DELETE /api/projects/:id  (auth required)
GET    /api/posts
POST   /api/posts         (auth required)
PUT    /api/posts/:id     (auth required)
DELETE /api/posts/:id     (auth required)
```

JWT middleware lives in `server/middleware/auth.js`. Protected routes attach to `req.user`.

### Models

- `User`: email, passwordHash, role (`admin` | `user`)
- `Project`: title, description, image (Cloudinary URL), link, github, tags[], createdAt
- `Post`: title, slug, content (markdown), coverImage, tags[], publishedAt

---

## Environment Variables

**Next.js** (`/.env.local` — copy from `.env.local.example`):
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_POSTHOG_KEY=
NEXT_PUBLIC_POSTHOG_HOST=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

**Express** (`/server/.env` — copy from `server/.env.example`):
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/portfolio
JWT_SECRET=
FRONTEND_URL=http://localhost:3000
```

---

## Development Commands

```bash
# Install all dependencies
npm install
cd server && npm install && cd ..

# Development
npm run dev:all       # Next.js + Express together
npm run dev           # Next.js only

# Build
npm run build
npm start

# Lint
npm run lint
```

---

## What's Done ✅

- [x] Next.js 14 App Router migration from Vite
- [x] ThreeScene: full 3D hero with avatar, rock, CSS3D cards, GSAP scroll
- [x] 7-light cinematic lighting rig with cursor reactivity
- [x] Gold halo portal effect (canvas radial gradient on plane)
- [x] Avatar landing sequence with idle animations
- [x] HomeWorkSection with featured + grid project cards
- [x] LogoParticles migration effect (hero → work section)
- [x] MigrationController (scroll-driven particle transition)
- [x] DenseOrb (animated 3D orb in work section)
- [x] Navbar with LogoScene (R3F logo in navbar)
- [x] Page transition system (TransitionLink + PageTransitionOverlay)
- [x] Custom cursor (cursor: none)
- [x] Lenis smooth scroll
- [x] Design tokens (CSS variables + JS mirrors)
- [x] Express backend with auth, projects, posts CRUD
- [x] MongoDB models (User, Project, Post)
- [x] Admin login page
- [x] Admin dashboard (basic structure)
- [x] shadcn/ui integration
- [x] PostHog analytics setup
- [x] Tailwind + Inter + Playfair Display

---

## What's NOT Done Yet ❌

### High Priority

- [ ] **Admin dashboard** — upload form for images (Cloudinary), create/edit/delete projects and posts. `app/admin/dashboard/page.tsx` is skeletal.
- [ ] **Projects page** — `app/projects/page.tsx` fetches from API but needs real data + layout polish
- [ ] **Blog page** — `app/blog/page.tsx` needs markdown rendering (consider `next-mdx-remote`)
- [ ] **CV page** — `app/cv/page.tsx` is a stub
- [ ] **Mobile responsiveness** — ThreeScene is desktop-only. Need a fallback for screens < 768px (static image or simplified 2D version)
- [ ] **Real project data** — HomeWorkSection currently uses hardcoded `SHOWCASE` array with placeholder Unsplash images

### Medium Priority

- [ ] **SEO** — `metadata` exports missing from most pages. Add `generateMetadata()` to all pages.
- [ ] **Performance** — ThreeScene loads eagerly. Consider lazy-loading GLTFs after LCP.
- [ ] **Error boundaries** — No error boundary wrapping ThreeScene. If WebGL fails silently, the page shows nothing.
- [ ] **Loading state** — No skeleton/loader shown while avatar GLTFs fetch
- [ ] **Image optimization** — Card images (`Image1–6.png`) are not using `next/image`
- [ ] **Cloudinary upload** — `lib/cloudinary.ts` has helpers but admin dashboard doesn't call them yet

### Lower Priority

- [ ] **Blog slugs** — `/blog/[slug]` page does not exist yet
- [ ] **Project detail pages** — `/projects/[id]` does not exist
- [ ] **Contact form** — CONNECT card links nowhere
- [ ] **Scroll progress indicator** — `ScrollIndicator.tsx` exists but is not mounted anywhere
- [ ] **Dark/light toggle** — Not planned but worth flagging
- [ ] **i18n** — Arabic content on owner's social; no multilingual support yet

---

## Known Issues / Watch Out For

### ThreeScene + StrictMode
`useEffect` runs twice in React StrictMode. There is a `cleanupFn.current` guard (`if (cleanupFn.current) return`) to prevent double-init. **Do not remove this guard.**

### CSS3DRenderer z-fighting
The CSS3D container must be positioned on top of the WebGL canvas. This is achieved via absolute positioning and `zIndex`. Do not add any CSS `transform` to the parent containers — it breaks CSS3D perspective.

### GSAP ScrollTrigger + Lenis
ScrollTrigger must be initialized after Lenis because Lenis overrides `window.scrollY`. The `LenisProvider` sets up the GSAP ticker integration. If cards stop responding to scroll, check the Lenis `<→` GSAP integration in `LenisProvider.tsx`.

### Tailwind + Three.js canvas
The WebGL canvas is inside a `div` that Tailwind does not know about. Do not add Tailwind classes directly to `webglRef` or `css3dRef` containers — use inline styles only.

### Server CORS
In production, `FRONTEND_URL` must be set in `server/.env`. Without it the CORS allowlist only includes `localhost:3000`.

### GLB paths
All `.glb` files must be in `/public/`. Next.js serves them from there. The paths in `ThreeScene.tsx` (`/avatar.glb`, `/avatar2.glb`) are root-relative and work in both dev and production.

---

## 3D Design Inspiration

High-quality references for the aesthetic direction of this portfolio.

---

### 🏆 Award & Showcase Galleries
*Start here when looking for new ideas — updated daily/weekly*

| Site | Why it's relevant |
|---|---|
| [awwwards.com](https://www.awwwards.com) | **#1 web design awards site.** SOTD/SOTY winners = best of the best. Filter by "Three.js", "WebGL", or "Portfolio". |
| [awwwards.com/websites/three-js](https://www.awwwards.com/websites/three-js/) | Pre-filtered Three.js collection. |
| [cssdesignawards.com](https://www.cssdesignawards.com) | Similar to Awwwards, different jury. Good for dark/premium aesthetic sites. |
| [siteinspire.com](https://www.siteinspire.com) | Curated hand-picked gallery, strong editorial taste. |
| [httpster.net](https://httpster.net) | Fast-browsing gallery, heavy on minimal + creative developer portfolios. |
| [godly.website](https://godly.website) | **Best for modern 3D/WebGL sites.** Specifically curated for cutting-edge web. |
| [landing.love](https://landing.love) | Landing pages only — great for hero section inspiration. |
| [landings.dev](https://landings.dev) | Similar to landing.love, strong animation focus. |
| [minimal.gallery](https://minimal.gallery) | Dark minimal sites — matches this project's aesthetic perfectly. |

---

### 🎨 Creative Portfolios & Studios
*Direct aesthetic references for this project*

| Site | Why it's relevant |
|---|---|
| [bruno-simon.com](https://bruno-simon.com) | **Gold standard** for 3D portfolios. Three.js + GSAP, fully interactive. |
| [lusion.co](https://lusion.co) | Dense particles, dark luxury feel. **Closest to this project's atmosphere.** |
| [activetheory.net](https://activetheory.net) | Cinematic WebGL agency work. Lighting + depth reference. |
| [robbowen.digital](https://robbowen.digital) | Dark, typographic, premium — excellent nav + transition reference. |
| [akella.com](https://akella.com) | GLSL transitions master. Strong WebGL fundamentals tutorials too. |
| [paper-planes.net](https://paper-planes.net) | CSS3D + WebGL hybrid — exact same rendering technique as this project. |
| [edouardthomasset.com](https://edouardthomasset.com) | Minimal dark portfolio with subtle 3D elements. |
| [karim.io](https://karim.io) | Strong typographic portfolio with WebGL accents. |
| [antoinebresard.com](https://antoinebresard.com) | Smooth page transitions, dark luxury feel. |
| [clementwalter.com](https://clementwalter.com) | Abstract WebGL, very experimental. |

---

### 📚 Tutorials & Technical Resources

| Site | Why it's relevant |
|---|---|
| [tympanus.net/codrops](https://tympanus.net/codrops) | **Best WebGL/CSS tutorial site.** New demos weekly. Particle systems, image transitions, scroll effects. |
| [threejs-journey.com](https://threejs-journey.com) | Bruno Simon's course — definitive Three.js reference. Lighting lessons 15–16 directly apply here. |
| [gsap.com/docs](https://gsap.com/docs/v3/Plugins/ScrollTrigger/) | GSAP ScrollTrigger official docs. |
| [discoverthreejs.com](https://discoverthreejs.com/book/first-steps/physically-based-rendering/) | PBR + tone mapping reference. |
| [threejs.org/examples](https://threejs.org/examples/) | Official Three.js demos. Check `#css3d_periodictable` for card technique reference. |
| [shader-school.github.io](https://github.com/stackgl/shader-school) | GLSL fundamentals if adding custom shaders later. |

---

### 🎯 Specific Techniques — Direct References

| What to build | Best reference |
|---|---|
| CSS3D cards (current technique) | [threejs.org/examples/#css3d_periodictable](https://threejs.org/examples/#css3d_periodictable) |
| Particle migration / morphing | [Codrops: GPU Particles](https://tympanus.net/codrops/2019/01/17/gpu-particles-with-three-js/) |
| Cinematic lighting rig | Three.js Journey — Lesson 15 (Lights) + Lesson 16 (Shadows) |
| Scroll-driven 3D camera | [Codrops: Scroll-based animation](https://tympanus.net/codrops/2022/12/13/how-to-create-a-scroll-based-3d-animation-with-inertia/) |
| GLSL image hover distortion | [akella's YouTube](https://www.youtube.com/@akella_) |
| Fluid/blob shaders | [Codrops: Blob animation](https://tympanus.net/codrops/2019/10/08/creating-a-water-like-effect-with-three-js/) |
| Page transition shards | [Codrops: Page transitions](https://tympanus.net/codrops/2018/06/20/page-curl-effect-with-three-js/) |

---

### 💡 YouTube Channels for Ongoing Learning

| Channel | Focus |
|---|---|
| [Yuri Artiukh (akella)](https://www.youtube.com/@akella_) | WebGL effects, GLSL shaders, Three.js — very practical |
| [Bruno Simon](https://www.youtube.com/@BrunoSimon) | Three.js journey author, occasional deep dives |
| [Fireship](https://www.youtube.com/@Fireship) | Quick modern web concepts |
| [The Coding Train](https://www.youtube.com/@TheCodingTrain) | Creative coding, p5.js, generative art fundamentals |

---

## Claude Workflow Notes

When I say **"3d"** I mean this portfolio project. When picking up where we left off:

1. Check the **What's NOT Done Yet** section first
2. Read the relevant component before editing it
3. Never break the `cleanupFn.current` guard in `ThreeScene.tsx`
4. Always use `TransitionLink` not plain `<Link>` for internal routes
5. Always use CSS variables (`var(--gold)`, etc.) not hardcoded hex values
6. New components go in `components/` — pages go in `app/`
7. Backend changes go in `server/` — never put API logic in `app/api/` unless specifically migrating away from Express
