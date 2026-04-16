'use client'

import { useState, useEffect } from 'react'
import { useRouter }           from 'next/navigation'
import { Eye, EyeOff }         from 'lucide-react'

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
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1.5rem',
      background: 'var(--bg)',
    }}>
      <div style={{ width: '100%', maxWidth: '360px' }}>

        {/* Logo mark */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '36px' }}>
          <div style={{
            width: '48px', height: '48px',
            borderRadius: '14px',
            border: '1px solid var(--gold-border)',
            background: 'var(--gold-subtle)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <div style={{
              width: '18px', height: '18px', borderRadius: '50%',
              border: '1.5px solid var(--gold)',
              boxShadow: '0 0 10px var(--gold-glow)',
            }} />
          </div>
        </div>

        {/* Heading */}
        <h1 style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: '1.8rem', fontWeight: 700,
          color: '#fff', textAlign: 'center', marginBottom: '6px',
        }}>
          Admin
        </h1>
        <p style={{
          fontSize: '12px', textAlign: 'center',
          color: 'var(--text-dim)', marginBottom: '32px',
          letterSpacing: '0.05em',
        }}>
          Sign in to manage your portfolio
        </p>

        {/* Error */}
        {error && (
          <div style={{
            marginBottom: '20px',
            padding: '12px 16px',
            borderRadius: 'var(--radius-sm)',
            background: 'rgba(239,68,68,0.08)',
            border: '1px solid rgba(239,68,68,0.2)',
            fontSize: '12px', color: '#f87171', textAlign: 'center',
          }}>
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <Field label="Email">
            <input
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                style={{ ...inputStyle, paddingRight: '44px' }}
              />
              <button
                type="button"
                onClick={() => setShowPass((v) => !v)}
                aria-label={showPass ? 'Hide password' : 'Show password'}
                style={{
                  position: 'absolute', right: '12px', top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'none',
                  color: 'var(--text-dim)', display: 'flex',
                }}
              >
                {showPass
                  ? <EyeOff style={{ width: '15px', height: '15px' }} />
                  : <Eye    style={{ width: '15px', height: '15px' }} />}
              </button>
            </div>
          </Field>

          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: '8px',
              width: '100%',
              padding: '13px',
              borderRadius: 'var(--radius-sm)',
              background: loading ? 'rgba(201,168,76,0.5)' : 'var(--gold)',
              color: '#0a0700',
              fontSize: '12px',
              fontWeight: 600,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              border: 'none',
              cursor: loading ? 'default' : 'none',
              transition: 'background 0.2s, box-shadow 0.2s',
              boxShadow: loading ? 'none' : '0 0 20px var(--gold-glow)',
            }}
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </div>
    </main>
  )
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '13px 14px',
  borderRadius: 'var(--radius-sm)',
  background: 'rgba(255,255,255,0.03)',
  border: '1px solid var(--border)',
  color: '#fff',
  fontSize: '13px',
  outline: 'none',
  cursor: 'none',
  transition: 'border-color 0.2s',
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <label style={{
        fontSize: '10px', letterSpacing: '0.2em',
        textTransform: 'uppercase', color: 'var(--text-dim)',
      }}>
        {label}
      </label>
      {children}
    </div>
  )
}
