'use client'

import { ArrowUpRight }      from 'lucide-react'
import TransitionLink        from '@/components/TransitionLink'
import { motion, Variants }  from 'framer-motion'
import MagneticButton        from '@/components/MagneticButton'

export default function FinalCTA() {
  const container: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2, delayChildren: 0.1 },
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
    <section className="relative z-10 w-full bg-[#050505] pt-32 pb-32 md:pt-48 md:pb-48 border-t border-white/[0.03] overflow-hidden">
      {/* Background Glow */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-40">
        <div className="w-[80vw] h-[80vw] md:w-[40vw] md:h-[40vw] rounded-full bg-gold/5 blur-[120px]" />
      </div>

      <motion.div 
        variants={container}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-10%" }}
        className="max-w-[1320px] mx-auto px-6 md:px-12 lg:px-20 text-center relative z-10"
      >
        
        <div className="flex flex-col items-center">
          
          <motion.span variants={item} className="font-inter text-[10px] md:text-[11px] font-medium tracking-[0.4em] uppercase text-gold/70 mb-8">
            Next Steps
          </motion.span>
          
          <motion.h2 
            variants={item}
            className="font-display text-[clamp(3rem,8vw,7rem)] font-bold text-white leading-[0.95] tracking-tight mb-12"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Have a project<br />
            <em className="italic font-normal text-gold">in mind?</em>
          </motion.h2>

          <motion.div variants={item}>
            <MagneticButton>
              <TransitionLink 
                href="/contact"
                className="group relative inline-flex items-center justify-center gap-4 px-10 py-5 md:px-12 md:py-6 rounded-full bg-white text-[#050505] overflow-hidden cursor-none transition-transform duration-500 hover:scale-105 hover:shadow-[0_0_40px_rgba(255,255,255,0.15)]"
              >
                <div className="absolute inset-0 bg-gold translate-y-[100%] group-hover:translate-y-0 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]" />
                <span className="relative z-10 font-inter text-[12px] md:text-[14px] font-bold tracking-[0.2em] uppercase">
                  Start a Conversation
                </span>
                <ArrowUpRight size={18} strokeWidth={2.5} className="relative z-10 group-hover:rotate-12 transition-transform duration-500" />
              </TransitionLink>
            </MagneticButton>
          </motion.div>

        </div>
      </motion.div>
    </section>
  )
}
