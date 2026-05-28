'use client'

import { motion, Variants } from 'framer-motion'

const PROCESS_STEPS = [
  {
    num: '01',
    title: 'Discovery & Vision',
    desc: 'Understanding the brand’s core identity, defining the technical requirements, and establishing a cinematic visual direction that aligns with the business goals.'
  },
  {
    num: '02',
    title: 'Architecture & Prototyping',
    desc: 'Engineering the technical foundation. Establishing the WebGL pipeline, data models, and creating low-fidelity motion prototypes to test user flow.'
  },
  {
    num: '03',
    title: 'Design & Craft',
    desc: 'Fleshing out the UI with high-end typography, deep gradients, and structural layouts. Syncing the 3D environment seamlessly with the DOM.'
  },
  {
    num: '04',
    title: 'Motion & Polish',
    desc: 'The final 20% that takes 80% of the effort. Implementing custom cursors, scroll physics, staggered reveals, and ensuring a locked 60FPS across all devices.'
  }
]

export default function ProcessSection() {
  const container: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: 0.2 },
    },
  }

  const item: Variants = {
    hidden: { opacity: 0, y: 40 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 1.0, ease: [0.16, 1, 0.3, 1] },
    },
  }

  return (
    <section className="relative z-10 w-full bg-transparent pt-24 pb-32 md:pt-32 md:pb-48 overflow-hidden">
      <motion.div 
        variants={container}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-10%" }}
        className="max-w-[1320px] mx-auto px-6 md:px-12 lg:px-20"
      >
        
        {/* Header */}
        <motion.div variants={item} className="mb-20 md:mb-32">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-8 h-px bg-gold/70" />
            <span className="font-inter text-[9px] font-medium tracking-[0.38em] uppercase text-gold/70">
              Methodology
            </span>
          </div>
          <motion.h2 
            className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-white tracking-tight"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            The Creative<br />
            <em className="italic font-normal text-gold">Process.</em>
          </motion.h2>
        </motion.div>

        {/* Timeline */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
          {PROCESS_STEPS.map((step, i) => (
            <motion.div 
              variants={item}
              key={step.num}
              className="flex flex-col relative"
            >
              {/* Connecting line (desktop only) */}
              {i < PROCESS_STEPS.length - 1 && (
                <div className="hidden lg:block absolute top-[11px] left-[40px] right-[-30px] h-px bg-gradient-to-r from-gold/40 to-transparent" />
              )}
              
              {/* Step Marker */}
              <div className="flex items-center gap-6 mb-8 relative z-10">
                <div className="w-6 h-6 rounded-full border border-gold/40 bg-[#050505] flex items-center justify-center shrink-0">
                  <div className="w-1.5 h-1.5 rounded-full bg-gold" />
                </div>
                <span className="font-inter text-[14px] md:text-[16px] font-medium tracking-[0.1em] text-white/30">
                  {step.num}
                </span>
              </div>

              {/* Content */}
              <h3 
                className="font-display text-xl md:text-2xl font-bold text-white mb-4"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                {step.title}
              </h3>
              <p className="font-inter text-[13px] md:text-[14px] text-white/40 leading-relaxed">
                {step.desc}
              </p>
            </motion.div>
          ))}
        </div>

      </motion.div>
    </section>
  )
}
