'use client'

import { useState, useEffect } from 'react'
import { useRouter }           from 'next/navigation'
import { Eye, EyeOff }         from 'lucide-react'
import TransitionLink           from '@/components/TransitionLink'

export default function AdminLoginPage() {
  const router = useRouter()
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState<string | null>(null)

  useEffect(() => {
    if (typeof window !== 'undefined' && localStorage.getItem('admin_token')) {
      router.replace('/admin/dashboard')
    }
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000'
      const res = await fetch(`${apiUrl}/api/auth/login`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email, password }),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.message ?? 'Invalid credentials')
      }
      const { token } = await res.json()
      localStorage.setItem('admin_token', token)
      router.push('/admin/dashboard')
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main style={{
      minHeight:       '100vh',
      display:         'flex',
      flexDirection:   'column',
      alignItems:      'center',
      justifyContent:  'center',
      padding:         '2rem',
      background:      'var(--bg)',
      position:        'relative',
      overflow:        'hidden',
    }}>

      {/* Atmospheric background — restrained, not decorative */}
      <div aria-hidden style={{
        position:   'fixed', inset: 0,
        background: 'radial-gradient(ellipse 60% 50% at 50% 42%, rgba(201,168,76,0.045) 0%, transparent 100%)',
        pointerEvents: 'none',
      }} />

      {/* Card */}
      <div style={{
        position:     'relative',
        zIndex:       1,
        width:        '100%',
        maxWidth:     '380px',
        background:   'var(--surface)',
        border:       '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
        padding:      '44px 40px 36px',
        boxShadow:    'inset 0 1px 0 rgba(255,255,255,0.05), var(--shadow-lg)',
      }}>

        {/* ── Brand mark ── */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '32px' }}>
          {/* Reticle — matches Navbar */}
          <span style={{ position: 'relative', width: '32px', height: '32px', display: 'block' }}>
            <span style={{
              position:     'absolute', inset: 0,
              borderRadius: '50%',
              border:       '1px solid var(--gold-border)',
            }} />
            {/* Cross-hair ticks */}
            <span style={{
              position:   'absolute', top: '50%', left: 0,
              width:      '6px', height: '1px',
              background: 'var(--gold-border)',
              transform:  'translateY(-50%)',
            }} />
            <span style={{
              position:   'absolute', top: '50%', right: 0,
              width:      '6px', height: '1px',
              background: 'var(--gold-border)',
              transform:  'translateY(-50%)',
            }} />
            <span style={{
              position:   'absolute', left: '50%', top: 0,
              height:     '6px', width: '1px',
              background: 'var(--gold-border)',
              transform:  'translateX(-50%)',
            }} />
            <span style={{
              position:   'absolute', left: '50%', bottom: 0,
              height:     '6px', width: '1px',
              background: 'var(--gold-border)',
              transform:  'translateX(-50%)',
            }} />
            {/* Center dot */}
            <span style={{
              position:     'absolute', top: '50%', left: '50%',
              transform:    'translate(-50%, -50%)',
              width:        '6px', height: '6px',
              borderRadius: '50%',
              background:   'var(--gold)',
              boxShadow:    '0 0 10px var(--gold-glow)',
            }} />
          </span>
        </div>

        {/* ── Heading ── */}
        <h1 style={{
          fontFamily:    "'Playfair Display', serif",
          fontSize:      '1.75rem', fontWeight: 700,
          color:         '#fff', textAlign: 'center',
          letterSpacing: '-0.020em', lineHeight: 1.15,
          marginBottom:  '7px',
        }}>
          Admin
        </h1>
        <p style={{
          fontFamily:    "'Inter', sans-serif",
          fontSize:      '11px', textAlign: 'center',
          color:         'var(--text-dim)',
          letterSpacing: '0.05em', lineHeight: 1.5,
          marginBottom:  '32px',
        }}>
          Sign in to manage your portfolio
        </p>

        {/* ── Thin gold rule ── */}
        <div style={{
          height:       '1px',
          background:   'linear-gradient(90deg, transparent, var(--gold-border), transparent)',
          marginBottom: '28px',
        }} />

        {/* ── Error ── */}
        {error && (
          <div style={{
            marginBottom: '20px',
            padding:      '11px 14px',
            borderRadius: 'var(--radius-sm)',
            background:   'rgba(239,68,68,0.07)',
            border:       '1px solid rgba(239,68,68,0.18)',
            fontFamily:   "'Inter', sans-serif",
            fontSize:     '12px', color: '#f87171',
            textAlign:    'center', lineHeight: 1.5,
          }}>
            {error}
          </div>
        )}

        {/* ── Form ── */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

          <Field label="Email">
            <input
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="admin@example.com"
              style={inputStyle}
            />
          </Field>

          <Field label="Password">
            <div style={{ position: 'relative' }}>
              <input
                type={showPass ? 'text' : 'password'}
                autoComplete="current-password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                style={{ ...inputStyle, paddingRight: '44px' }}
              />
              <button
                type="button"
                onClick={() => setShowPass(v => !v)}
                aria-label={showPass ? 'Hide password' : 'Show password'}
                style={{
                  position:   'absolute', right: '13px', top: '50%',
                  transform:  'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'none',
                  color:      'var(--text-dim)',
                  display:    'flex', alignItems: 'center',
                  padding:    '2px',
                  transition: 'color var(--t-fast)',
                }}
                onMouseEnter={e => (e.currentTarget.style.color = 'var(--gold)')}
                onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-dim)')}
              >
                {showPass
                  ? <EyeOff style={{ width: '14px', height: '14px' }} />
                  : <Eye    style={{ width: '14px', height: '14px' }} />}
              </button>
            </div>
          </Field>

          <button
            type="submit"
            disabled={loading}
            className="btn-gold"
            style={{
              marginTop:       '6px',
              width:           '100%',
              justifyContent:  'center',
              opacity:         loading ? 0.5 : 1,
              cursor:          loading ? 'default' : 'none',
              transition:      'background var(--t-base), box-shadow var(--t-base), opacity var(--t-base)',
            }}
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>

        </form>

        {/* ── Footer ── */}
        <div style={{
          marginTop:  '28px',
          paddingTop: '20px',
          borderTop:  '1px solid var(--border)',
          display:    'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <TransitionLink
            href="/"
            style={{
              fontFamily:    "'Inter', sans-serif",
              fontSize:      '10px',
              color:         'var(--text-dim)',
              letterSpacing: '0.06em',
              textDecoration:'none',
              transition:    'color var(--t-fast)',
            }}
          >
            ← Portfolio
          </TransitionLink>
          <span style={{
            fontFamily:    "'Inter', sans-serif",
            fontSize:      '9px',
            color:         'var(--text-ghost)',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
          }}>
            Admin v1
          </span>
        </div>

      </div>
    </main>
  )
}

/* ─── Shared input style ─────────────────────────────────────────────────────── */
const inputStyle: React.CSSProperties = {
  width:        '100%',
  padding:      '12px 14px',
  borderRadius: 'var(--radius-sm)',
  background:   'rgba(255,255,255,0.03)',
  border:       '1px solid var(--border)',
  color:        '#fff',
  fontSize:     '13px',
  outline:      'none',
  cursor:       'none',
  fontFamily:   "'Inter', sans-serif",
  transition:   'border-color var(--t-base), box-shadow var(--t-base)',
}

/* ─── Field wrapper ──────────────────────────────────────────────────────────── */
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
      <label style={{
        fontFamily:    "'Inter', sans-serif",
        fontSize:      '9px', fontWeight: 500,
        letterSpacing: '0.22em', textTransform: 'uppercase',
        color:         'var(--text-dim)',
      }}>
        {label}
      </label>
      {children}
    </div>
  )
}
