'use client'

import { ArrowUpRight }      from 'lucide-react'
import PageShell             from '@/components/PageShell'
import { motion, Variants }  from 'framer-motion'

export default function ContactPage() {
  const container: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: 0.1 },
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
    <PageShell>
      <main
        className="min-h-screen pb-32"
        style={{ background: 'var(--bg)', paddingTop: '112px' }}
      >
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 clamp(20px, 5vw, 40px)' }}>
          
          <motion.div 
            variants={container}
            initial="hidden"
            animate="visible"
            style={{ marginBottom: '64px' }}
          >
            <motion.p variants={item} className="section-label" style={{ marginBottom: '20px' }}>
              Initiate
            </motion.p>

            <motion.h1 
              variants={item}
              style={{
                fontFamily:    "'Playfair Display', serif",
                fontSize:      'clamp(2.4rem, 6vw, 5.2rem)',
                fontWeight:    700,
                color:         '#fff',
                lineHeight:    1.06,
                letterSpacing: '-0.025em',
                marginBottom:  '28px',
              }}
            >
              Let's create<br />
              <em style={{ fontStyle: 'italic', color: 'var(--gold)' }}>something new.</em>
            </motion.h1>

            <motion.p 
              variants={item}
              style={{
                fontFamily:  "'Inter', sans-serif",
                fontSize:    '14px',
                color:       'var(--text-muted)',
                lineHeight:  1.75,
                maxWidth:    '48ch',
                marginBottom:'48px',
              }}
            >
              Currently accepting new projects and freelance opportunities. 
              Whether you have a fully formed brief or just an idea, I'd love to hear about it.
            </motion.p>

            <motion.div variants={item} className="gold-line" style={{ marginBottom: '48px' }} />

            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
              <motion.div variants={item}>
                <p style={{
                  fontFamily:    "'Inter', sans-serif",
                  fontSize:      '9px', fontWeight: 500,
                  letterSpacing: '0.28em', textTransform: 'uppercase',
                  color:         'var(--gold)',
                  marginBottom:  '12px',
                }}>
                  Direct
                </p>
                <a 
                  href="mailto:hello@example.com" 
                  className="group inline-flex items-center gap-3 text-xl md:text-2xl text-white hover:text-gold transition-colors cursor-none"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  hello@example.com
                  <ArrowUpRight size={20} className="text-gold opacity-0 group-hover:opacity-100 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
                </a>
              </motion.div>

              <motion.div variants={item}>
                <p style={{
                  fontFamily:    "'Inter', sans-serif",
                  fontSize:      '9px', fontWeight: 500,
                  letterSpacing: '0.28em', textTransform: 'uppercase',
                  color:         'var(--gold)',
                  marginBottom:  '12px',
                }}>
                  Socials
                </p>
                <div style={{ display: 'flex', gap: '24px' }}>
                  {['Twitter', 'LinkedIn', 'GitHub'].map((platform) => (
                    <a 
                      key={platform}
                      href="#" 
                      className="text-[12px] tracking-widest uppercase text-white/50 hover:text-white transition-colors cursor-none"
                      style={{ fontFamily: "'Inter', sans-serif" }}
                    >
                      {platform}
                    </a>
                  ))}
                </div>
              </motion.div>
            </div>

          </motion.div>
        </div>
      </main>
    </PageShell>
  )
}
