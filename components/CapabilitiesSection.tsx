'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, Variants } from 'framer-motion'
import { ArrowUpRight } from 'lucide-react'
import { cn } from '@/lib/utils'

const CAPABILITIES = [
  {
    id: '01',
    title: 'Creative Development',
    description: 'Transforming static designs into living, breathing digital environments using advanced DOM manipulation and framework architectures.',
    tags: ['React', 'Next.js', 'TypeScript', 'Tailwind CSS']
  },
  {
    id: '02',
    title: 'WebGL & 3D Engineering',
    description: 'Building performant, immersive 3D scenes that run smoothly in the browser, utilizing custom shaders and complex geometry.',
    tags: ['Three.js', 'React Three Fiber', 'GLSL', 'Blender']
  },
  {
    id: '03',
    title: 'Motion Design',
    description: 'Choreographing seamless transitions and physics-based interactions that guide the user’s eye and elevate the brand experience.',
    tags: ['GSAP', 'Framer Motion', 'Lenis', 'CSS Animations']
  }
]

export default function CapabilitiesSection() {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null)

  const container: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.1 },
    },
  }

  const item: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 1.0, ease: [0.16, 1, 0.3, 1] },
    },
  }

  return (
    <section className="relative z-10 w-full bg-[#050505] pt-24 pb-32 md:pt-32 md:pb-48 border-t border-white/[0.03]">
      <motion.div 
        variants={container}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-10%" }}
        className="max-w-[1320px] mx-auto px-6 md:px-12 lg:px-20"
      >
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-20 md:mb-32">
          <motion.div variants={item}>
            <h2 
              className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-white tracking-tight"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Capabilities &amp;<br />
              <em className="italic font-normal text-gold">Expertise.</em>
            </h2>
          </motion.div>
          
          <motion.div variants={item} className="max-w-sm">
            <p className="font-inter text-[14px] text-white/50 leading-relaxed">
              I partner with forward-thinking brands and agencies to build digital products that defy convention and demand attention.
            </p>
          </motion.div>
        </div>

        {/* Capabilities List */}
        <div className="flex flex-col border-t border-white/5">
          {CAPABILITIES.map((cap, i) => (
            <motion.div 
              variants={item}
              key={cap.id}
              onMouseEnter={() => setHoveredIdx(i)}
              onMouseLeave={() => setHoveredIdx(null)}
            >
              <div 
                className={cn(
                  "group relative flex flex-col lg:flex-row lg:items-center justify-between gap-8 py-10 md:py-16 border-b border-white/5 cursor-none transition-all duration-500",
                  hoveredIdx === i ? "bg-white/[0.02] px-6 -mx-6 lg:px-10 lg:-mx-10 rounded-xl border-transparent" : "bg-transparent"
                )}
              >
                {/* Number & Title */}
                <div className="flex items-baseline gap-6 md:gap-12 lg:w-1/3 shrink-0">
                  <span className={cn(
                    "font-inter text-[10px] md:text-[12px] font-medium tracking-[0.2em] transition-colors duration-500",
                    hoveredIdx === i ? "text-gold" : "text-white/20"
                  )}>
                    {cap.id}
                  </span>
                  <h3 
                    className="font-display text-2xl md:text-3xl lg:text-4xl font-bold text-white tracking-tight transition-transform duration-500 group-hover:translate-x-2"
                    style={{ fontFamily: "'Playfair Display', serif" }}
                  >
                    {cap.title}
                  </h3>
                </div>

                {/* Description */}
                <div className="lg:w-1/3">
                  <p className="font-inter text-[13px] md:text-[14px] text-white/40 leading-relaxed transition-colors duration-500 group-hover:text-white/70">
                    {cap.description}
                  </p>
                </div>

                {/* Tags & Action */}
                <div className="flex items-center justify-between lg:justify-end lg:w-1/3 gap-8">
                  <div className="flex flex-wrap gap-x-4 gap-y-2">
                    {cap.tags.map((tag) => (
                      <span key={tag} className="font-inter text-[10px] md:text-[11px] font-medium tracking-widest uppercase text-white/30 group-hover:text-gold/70 transition-colors duration-500">
                        {tag}
                      </span>
                    ))}
                  </div>
                  
                  <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center border transition-all duration-500 shrink-0",
                    hoveredIdx === i ? "bg-gold border-gold text-[#050505] scale-100" : "border-white/10 text-white/30 scale-90"
                  )}>
                    <ArrowUpRight size={16} className={cn("transition-transform duration-500", hoveredIdx === i ? "rotate-12" : "rotate-0")} />
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

      </motion.div>
    </section>
  )
}
