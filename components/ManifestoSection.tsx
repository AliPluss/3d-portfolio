'use client'

import { useEffect, useRef } from 'react'

import { motion, Variants } from 'framer-motion'

export default function ManifestoSection() {
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
      transition: { duration: 1.2, ease: [0.16, 1, 0.3, 1] },
    },
  }

  return (
    <section className="relative z-10 w-full bg-transparent pt-32 pb-16 md:pt-48 md:pb-32 overflow-hidden">
      <motion.div 
        variants={container}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-10%" }}
        className="max-w-[1320px] mx-auto px-6 md:px-12 lg:px-20"
      >
        
        {/* Sub-header */}
        <motion.div variants={item} className="flex items-center gap-4 mb-8">
          <div className="w-8 h-px bg-gold/70" />
          <span className="font-inter text-[9px] font-medium tracking-[0.38em] uppercase text-gold/70">
            Design Philosophy
          </span>
        </motion.div>

        {/* Massive Manifesto Typography */}
        <div className="max-w-4xl overflow-hidden py-2">
          <motion.h2 
            variants={item}
            className="font-display text-[clamp(2.4rem,5vw,4.5rem)] font-bold text-white leading-[1.08] tracking-tight mb-12"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            I build digital experiences that live at the intersection of <em className="italic font-normal text-gold">engineering precision</em> and <em className="italic font-normal text-gold">cinematic motion.</em>
          </motion.h2>
        </div>

        {/* Supporting Paragraphs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-24 max-w-5xl ml-auto border-t border-white/5 pt-12">
          <motion.p variants={item} className="font-inter text-[14px] md:text-[15px] text-white/50 leading-relaxed">
            The web is no longer just a document viewer; it is the most powerful creative medium in existence. By combining hardware-accelerated WebGL with modern DOM layouts, we can create environments that feel physical, memorable, and deeply immersive.
          </motion.p>
          <motion.p variants={item} className="font-inter text-[14px] md:text-[15px] text-white/50 leading-relaxed">
            Performance is a prerequisite for luxury. A beautiful design loses its impact if it drops frames or taxes the device. My approach guarantees 60FPS fluid motion, responsive fallbacks, and a flawless narrative flow from the first load to the final interaction.
          </motion.p>
        </div>
      </motion.div>
    </section>
  )
}
