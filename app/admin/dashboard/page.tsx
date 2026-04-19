'use client'

import {
  useState, useEffect, useCallback, useRef,
} from 'react'
import { useRouter } from 'next/navigation'
import {
  Plus, Trash2, Edit3, X, LogOut,
  Loader2, CheckCircle, AlertCircle,
} from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────
interface Post {
  _id: string; title: string; excerpt: string
  body: string; thumbnail: string; date: string; slug: string
}
interface Project {
  _id: string; title: string; description: string
  image: string; link: string; github: string; tags: string
}
type Tab = 'posts' | 'projects'

// ─── Toast ────────────────────────────────────────────────────────────────────
function Toast({ msg, type }: { msg: string; type: 'ok' | 'err' }) {
  return (
    <div style={{
      position: 'fixed', bottom: '28px', right: '28px', zIndex: 200,
      display: 'flex', alignItems: 'center', gap: '10px',
      padding: '12px 18px',
      borderRadius: 'var(--radius-sm)',
      background: type === 'ok'
        ? 'rgba(201,168,76,0.1)' : 'rgba(239,68,68,0.1)',
      border: `1px solid ${type === 'ok' ? 'var(--gold-border)' : 'rgba(239,68,68,0.25)'}`,
      color: type === 'ok' ? 'var(--gold)' : '#f87171',
      fontSize: '12px',
      backdropFilter: 'blur(12px)',
      boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
      letterSpacing: '0.02em',
    }}>
      {type === 'ok'
        ? <CheckCircle style={{ width: '14px', height: '14px', flexShrink: 0 }} />
        : <AlertCircle style={{ width: '14px', height: '14px', flexShrink: 0 }} />}
      {msg}
    </div>
  )
}

// ─── API helper ───────────────────────────────────────────────────────────────
function useApi() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000'
  const authFetch = useCallback(async (path: string, opts: RequestInit = {}) => {
    const token = typeof window !== 'undefined'
      ? (localStorage.getItem('admin_token') ?? '') : ''
    const res = await fetch(`${apiUrl}${path}`, {
      ...opts,
      headers: {
        'Content-Type':  'application/json',
        Authorization:   `Bearer ${token}`,
        ...(opts.headers ?? {}),
      },
    })
    if (!res.ok) {
      const b = await res.json().catch(() => ({}))
      throw new Error(b.message ?? `HTTP ${res.status}`)
    }
    return res.json()
  }, [apiUrl])
  return { authFetch }
}

// ═══════════════════════════════════════════════════════════════════════════════
export default function AdminDashboard() {
  const router = useRouter()
  const [tab,   setTab]   = useState<Tab>('posts')
  const [toast, setToast] = useState<{ msg: string; type: 'ok' | 'err' } | null>(null)

  useEffect(() => {
    if (typeof window !== 'undefined' && !localStorage.getItem('admin_token')) {
      router.replace('/admin')
    }
  }, [router])

  const showToast = (msg: string, type: 'ok' | 'err') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  return (
    <main style={{
      minHeight: '100vh',
      background: 'var(--bg)',
      paddingTop: '80px',
      paddingBottom: '80px',
    }}>
      <div style={{ maxWidth: '960px', margin: '0 auto', padding: '0 24px' }}>

        {/* ── Header ── */}
        <div style={{
          display: 'flex', alignItems: 'flex-start',
          justifyContent: 'space-between', marginBottom: '48px',
        }}>
          <div>
            <p className="section-label" style={{ marginBottom: '12px' }}>
              Admin Panel
            </p>
            <h1 style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 'clamp(1.8rem, 4vw, 3rem)',
              fontWeight: 700, color: '#fff', lineHeight: 1.1, marginBottom: '8px',
              letterSpacing: '-0.02em',
            }}>
              Dashboard
            </h1>
            <p style={{ fontSize: '12px', color: 'var(--text-dim)', letterSpacing: '0.04em' }}>
              Manage your portfolio content
            </p>
          </div>

          <button
            onClick={() => { localStorage.removeItem('admin_token'); router.replace('/admin') }}
            style={{
              display: 'flex', alignItems: 'center', gap: '7px',
              fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase',
              color: 'var(--text-dim)',
              background: 'none', border: 'none', cursor: 'none',
              padding: '8px 0',
              transition: 'color 0.2s',
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = '#fff' }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-dim)' }}
          >
            <LogOut style={{ width: '13px', height: '13px' }} />
            Sign out
          </button>
        </div>

        {/* ── Gold divider ── */}
        <div style={{
          height: '1px', marginBottom: '36px',
          background: 'linear-gradient(90deg, var(--gold-border), transparent)',
        }} />

        {/* ── Tabs ── */}
        <div style={{
          display: 'flex', gap: '4px', marginBottom: '32px',
          padding: '4px',
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-sm)',
          width: 'fit-content',
        }}>
          {(['posts', 'projects'] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                padding: '8px 24px',
                borderRadius: '8px',
                fontSize: '10px', letterSpacing: '0.2em', textTransform: 'uppercase',
                border: 'none', cursor: 'none',
                background: tab === t ? 'var(--gold)' : 'transparent',
                color:      tab === t ? '#0a0700'     : 'var(--text-dim)',
                fontWeight: tab === t ? 600            : 400,
                transition: 'background 0.2s, color 0.2s',
                boxShadow:  tab === t ? '0 0 16px var(--gold-glow)' : 'none',
              }}
            >
              {t}
            </button>
          ))}
        </div>

        {/* ── Panels ── */}
        {tab === 'posts'    && <PostsPanel    showToast={showToast} />}
        {tab === 'projects' && <ProjectsPanel showToast={showToast} />}

        {toast && <Toast {...toast} />}
      </div>
    </main>
  )
}

// ─── Shared field + input styles ──────────────────────────────────────────────
const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '11px 14px',
  borderRadius: 'var(--radius-sm)',
  background: 'var(--surface)',
  border: '1px solid var(--border)',
  color: '#fff',
  fontSize: '13px',
  outline: 'none',
  resize: 'vertical',
  cursor: 'none',
  fontFamily: 'Inter, sans-serif',
  transition: 'border-color var(--t-base), box-shadow var(--t-base)',
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <label style={{
        fontSize: '9px', letterSpacing: '0.22em',
        textTransform: 'uppercase', color: 'var(--gold-muted)',
      }}>
        {label}
      </label>
      {children}
    </div>
  )
}

// ─── Modal ────────────────────────────────────────────────────────────────────
function Modal({
  title, onClose, children,
}: { title: string; onClose: () => void; children: React.ReactNode }) {
  // Trap focus inside modal
  const modalRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    modalRef.current?.focus()
  }, [])

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 100,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '16px',
        background: 'rgba(0,0,0,0.75)',
        backdropFilter: 'blur(6px)',
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        ref={modalRef}
        tabIndex={-1}
        style={{
          width: '100%', maxWidth: '520px',
          borderRadius: 'var(--radius)',
          background: '#0c0a08',
          border: '1px solid var(--gold-border)',
          boxShadow: '0 0 60px rgba(201,168,76,0.08), 0 40px 80px rgba(0,0,0,0.6)',
          display: 'flex', flexDirection: 'column',
          maxHeight: '90vh', overflow: 'hidden',
          outline: 'none',
        }}
      >
        {/* Modal header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '18px 22px',
          borderBottom: '1px solid var(--border)',
        }}>
          <h2 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: '1rem', fontWeight: 600, color: '#fff',
          }}>
            {title}
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'none', border: 'none', cursor: 'none',
              color: 'var(--text-dim)', padding: '4px',
              display: 'flex', transition: 'color 0.2s',
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = '#fff' }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-dim)' }}
          >
            <X style={{ width: '15px', height: '15px' }} />
          </button>
        </div>

        {/* Modal body */}
        <div style={{
          display: 'flex', flexDirection: 'column', gap: '14px',
          padding: '22px', overflowY: 'auto',
        }}>
          {children}
        </div>
      </div>
    </div>
  )
}

// ─── Modal action buttons ─────────────────────────────────────────────────────
function ModalActions({
  onClose, onSave, saving,
}: { onClose: () => void; onSave: () => void; saving: boolean }) {
  return (
    <div style={{ display: 'flex', gap: '10px', paddingTop: '6px' }}>
      <button
        type="button"
        onClick={onClose}
        style={{
          flex: 1, padding: '11px',
          borderRadius: 'var(--radius-sm)',
          background: 'transparent',
          border: '1px solid var(--border)',
          color: 'var(--text-muted)',
          fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase',
          cursor: 'none', transition: 'border-color 0.2s, color 0.2s',
        }}
        onMouseEnter={(e) => {
          const b = e.currentTarget as HTMLButtonElement
          b.style.borderColor = 'var(--border-bright)'
          b.style.color = '#fff'
        }}
        onMouseLeave={(e) => {
          const b = e.currentTarget as HTMLButtonElement
          b.style.borderColor = 'var(--border)'
          b.style.color = 'var(--text-muted)'
        }}
      >
        Cancel
      </button>
      <button
        type="button"
        onClick={onSave}
        disabled={saving}
        style={{
          flex: 1, padding: '11px',
          borderRadius: 'var(--radius-sm)',
          background: saving ? 'rgba(201,168,76,0.4)' : 'var(--gold)',
          border: 'none',
          color: '#0a0700',
          fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase',
          fontWeight: 600,
          cursor: saving ? 'default' : 'none',
          transition: 'background 0.2s, box-shadow 0.2s',
          boxShadow: saving ? 'none' : '0 0 16px var(--gold-glow)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
        }}
      >
        {saving
          ? <><Loader2 style={{ width: '13px', height: '13px', animation: 'spin 1s linear infinite' }} /> Saving</>
          : 'Save'}
      </button>
    </div>
  )
}

// ─── Row item ─────────────────────────────────────────────────────────────────
function ListRow({
  primary, secondary, onEdit, onDelete,
}: {
  primary: string; secondary?: string
  onEdit: () => void; onDelete: () => void
}) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '14px 16px',
      borderRadius: 'var(--radius-sm)',
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      transition: 'border-color 0.2s',
    }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--gold-border)'
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border)'
      }}
    >
      <div style={{ minWidth: 0 }}>
        <p style={{
          fontSize: '13px', color: 'rgba(255,255,255,0.88)',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          fontWeight: 500,
        }}>
          {primary}
        </p>
        {secondary && (
          <p style={{ fontSize: '10px', color: 'var(--text-dim)', marginTop: '2px', letterSpacing: '0.04em' }}>
            {secondary}
          </p>
        )}
      </div>
      <div style={{ display: 'flex', gap: '6px', marginLeft: '16px', flexShrink: 0 }}>
        <IconBtn onClick={onEdit}   label="Edit">
          <Edit3 style={{ width: '13px', height: '13px' }} />
        </IconBtn>
        <IconBtn onClick={onDelete} label="Delete" danger>
          <Trash2 style={{ width: '13px', height: '13px' }} />
        </IconBtn>
      </div>
    </div>
  )
}

function IconBtn({
  onClick, label, danger, children,
}: {
  onClick: () => void; label: string; danger?: boolean
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      style={{
        padding: '7px',
        borderRadius: '8px',
        background: 'transparent',
        border: '1px solid var(--border)',
        color: 'var(--text-dim)',
        cursor: 'none',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'color 0.2s, border-color 0.2s, background 0.2s',
      }}
      onMouseEnter={(e) => {
        const b = e.currentTarget as HTMLButtonElement
        b.style.color = danger ? '#f87171' : 'var(--gold)'
        b.style.borderColor = danger ? 'rgba(239,68,68,0.3)' : 'var(--gold-border)'
        b.style.background = danger ? 'rgba(239,68,68,0.06)' : 'var(--gold-subtle)'
      }}
      onMouseLeave={(e) => {
        const b = e.currentTarget as HTMLButtonElement
        b.style.color = 'var(--text-dim)'
        b.style.borderColor = 'var(--border)'
        b.style.background = 'transparent'
      }}
    >
      {children}
    </button>
  )
}

// ─── New Item button ──────────────────────────────────────────────────────────
function NewButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: '8px',
        padding: '10px 20px',
        borderRadius: 'var(--radius-sm)',
        background: 'var(--gold)',
        border: 'none',
        color: '#0a0700',
        fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase',
        fontWeight: 600,
        cursor: 'none',
        boxShadow: '0 0 16px var(--gold-glow)',
        transition: 'background 0.2s, box-shadow 0.2s',
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLButtonElement).style.background = 'var(--gold-bright)'
        ;(e.currentTarget as HTMLButtonElement).style.boxShadow = '0 0 24px var(--gold-glow-lg)'
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLButtonElement).style.background = 'var(--gold)'
        ;(e.currentTarget as HTMLButtonElement).style.boxShadow = '0 0 16px var(--gold-glow)'
      }}
    >
      <Plus style={{ width: '13px', height: '13px' }} />
      {label}
    </button>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// POSTS PANEL
// ═══════════════════════════════════════════════════════════════════════════════
function PostsPanel({ showToast }: { showToast: (m: string, t: 'ok' | 'err') => void }) {
  const { authFetch }             = useApi()
  const [posts,   setPosts]       = useState<Post[]>([])
  const [loading, setLoading]     = useState(true)
  const [editing, setEditing]     = useState<Partial<Post> | null>(null)
  const [saving,  setSaving]      = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try { setPosts(await authFetch('/api/posts')) }
    catch { showToast('Could not load posts', 'err') }
    finally { setLoading(false) }
  }, [authFetch, showToast])

  useEffect(() => { load() }, [load])

  const save = async () => {
    if (!editing) return
    setSaving(true)
    try {
      editing._id
        ? await authFetch(`/api/posts/${editing._id}`, { method: 'PUT',  body: JSON.stringify(editing) })
        : await authFetch('/api/posts',                  { method: 'POST', body: JSON.stringify(editing) })
      showToast('Saved', 'ok')
      setEditing(null)
      load()
    } catch (e) { showToast((e as Error).message, 'err') }
    finally { setSaving(false) }
  }

  const remove = async (id: string) => {
    if (!confirm('Delete this post?')) return
    try {
      await authFetch(`/api/posts/${id}`, { method: 'DELETE' })
      showToast('Deleted', 'ok')
      load()
    } catch (e) { showToast((e as Error).message, 'err') }
  }

  return (
    <div>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: '20px',
      }}>
        <p style={{ fontSize: '11px', color: 'var(--text-dim)', letterSpacing: '0.06em' }}>
          {loading ? '—' : `${posts.length} post${posts.length !== 1 ? 's' : ''}`}
        </p>
        <NewButton
          label="New Post"
          onClick={() => setEditing({ title: '', excerpt: '', body: '', thumbnail: '', slug: '' })}
        />
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
          <Loader2 style={{ width: '18px', height: '18px', color: 'var(--gold-muted)', animation: 'spin 1s linear infinite' }} />
        </div>
      ) : posts.length === 0 ? (
        <EmptyState label="No posts yet" />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {posts.map((post) => (
            <ListRow
              key={post._id}
              primary={post.title}
              secondary={new Date(post.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
              onEdit={() => setEditing(post)}
              onDelete={() => remove(post._id)}
            />
          ))}
        </div>
      )}

      {editing && (
        <Modal title={editing._id ? 'Edit Post' : 'New Post'} onClose={() => setEditing(null)}>
          <Field label="Title">
            <input
              style={inputStyle}
              value={editing.title ?? ''}
              onChange={(e) => setEditing((p) => ({ ...p, title: e.target.value }))}
              placeholder="Post title"
            />
          </Field>
          <Field label="Slug">
            <input
              style={inputStyle}
              value={editing.slug ?? ''}
              onChange={(e) => setEditing((p) => ({ ...p, slug: e.target.value }))}
              placeholder="url-friendly-slug"
            />
          </Field>
          <Field label="Excerpt">
            <textarea
              rows={2}
              style={inputStyle}
              value={editing.excerpt ?? ''}
              onChange={(e) => setEditing((p) => ({ ...p, excerpt: e.target.value }))}
              placeholder="Brief summary…"
            />
          </Field>
          <Field label="Body (Markdown)">
            <textarea
              rows={9}
              style={inputStyle}
              value={editing.body ?? ''}
              onChange={(e) => setEditing((p) => ({ ...p, body: e.target.value }))}
              placeholder="Full post content in Markdown…"
            />
          </Field>
          <Field label="Thumbnail URL">
            <input
              style={inputStyle}
              value={editing.thumbnail ?? ''}
              onChange={(e) => setEditing((p) => ({ ...p, thumbnail: e.target.value }))}
              placeholder="https://res.cloudinary.com/…"
            />
          </Field>
          <ModalActions onClose={() => setEditing(null)} onSave={save} saving={saving} />
        </Modal>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// PROJECTS PANEL
// ═══════════════════════════════════════════════════════════════════════════════
function ProjectsPanel({ showToast }: { showToast: (m: string, t: 'ok' | 'err') => void }) {
  const { authFetch }                 = useApi()
  const [projects, setProjects]       = useState<Project[]>([])
  const [loading,  setLoading]        = useState(true)
  const [editing,  setEditing]        = useState<Partial<Project> | null>(null)
  const [saving,   setSaving]         = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try { setProjects(await authFetch('/api/projects')) }
    catch { showToast('Could not load projects', 'err') }
    finally { setLoading(false) }
  }, [authFetch, showToast])

  useEffect(() => { load() }, [load])

  const save = async () => {
    if (!editing) return
    setSaving(true)
    try {
      const payload = {
        ...editing,
        tags: typeof editing.tags === 'string'
          ? (editing.tags as string).split(',').map((s) => s.trim()).filter(Boolean)
          : editing.tags,
      }
      editing._id
        ? await authFetch(`/api/projects/${editing._id}`, { method: 'PUT',  body: JSON.stringify(payload) })
        : await authFetch('/api/projects',                  { method: 'POST', body: JSON.stringify(payload) })
      showToast('Saved', 'ok')
      setEditing(null)
      load()
    } catch (e) { showToast((e as Error).message, 'err') }
    finally { setSaving(false) }
  }

  const remove = async (id: string) => {
    if (!confirm('Delete this project?')) return
    try {
      await authFetch(`/api/projects/${id}`, { method: 'DELETE' })
      showToast('Deleted', 'ok')
      load()
    } catch (e) { showToast((e as Error).message, 'err') }
  }

  return (
    <div>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: '20px',
      }}>
        <p style={{ fontSize: '11px', color: 'var(--text-dim)', letterSpacing: '0.06em' }}>
          {loading ? '—' : `${projects.length} project${projects.length !== 1 ? 's' : ''}`}
        </p>
        <NewButton
          label="New Project"
          onClick={() => setEditing({ title: '', description: '', image: '', link: '', github: '', tags: '' })}
        />
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
          <Loader2 style={{ width: '18px', height: '18px', color: 'var(--gold-muted)', animation: 'spin 1s linear infinite' }} />
        </div>
      ) : projects.length === 0 ? (
        <EmptyState label="No projects yet" />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {projects.map((project) => (
            <ListRow
              key={project._id}
              primary={project.title}
              secondary={
                Array.isArray(project.tags)
                  ? (project.tags as unknown as string[]).slice(0, 3).join(' · ')
                  : undefined
              }
              onEdit={() => setEditing({
                ...project,
                tags: Array.isArray(project.tags)
                  ? (project.tags as unknown as string[]).join(', ')
                  : project.tags,
              })}
              onDelete={() => remove(project._id)}
            />
          ))}
        </div>
      )}

      {editing && (
        <Modal title={editing._id ? 'Edit Project' : 'New Project'} onClose={() => setEditing(null)}>
          <Field label="Title">
            <input
              style={inputStyle}
              value={editing.title ?? ''}
              onChange={(e) => setEditing((p) => ({ ...p, title: e.target.value }))}
              placeholder="Project name"
            />
          </Field>
          <Field label="Description">
            <textarea
              rows={4}
              style={inputStyle}
              value={editing.description ?? ''}
              onChange={(e) => setEditing((p) => ({ ...p, description: e.target.value }))}
              placeholder="What did you build?"
            />
          </Field>
          <Field label="Image URL">
            <input
              style={inputStyle}
              value={editing.image ?? ''}
              onChange={(e) => setEditing((p) => ({ ...p, image: e.target.value }))}
              placeholder="https://res.cloudinary.com/…"
            />
          </Field>
          <Field label="Live URL">
            <input
              style={inputStyle}
              value={editing.link ?? ''}
              onChange={(e) => setEditing((p) => ({ ...p, link: e.target.value }))}
              placeholder="https://…"
            />
          </Field>
          <Field label="GitHub URL (optional)">
            <input
              style={inputStyle}
              value={editing.github ?? ''}
              onChange={(e) => setEditing((p) => ({ ...p, github: e.target.value }))}
              placeholder="https://github.com/…"
            />
          </Field>
          <Field label="Tags (comma-separated)">
            <input
              style={inputStyle}
              value={editing.tags ?? ''}
              onChange={(e) => setEditing((p) => ({ ...p, tags: e.target.value }))}
              placeholder="Three.js, React, Node.js"
            />
          </Field>
          <ModalActions onClose={() => setEditing(null)} onSave={save} saving={saving} />
        </Modal>
      )}
    </div>
  )
}

// ─── Empty state ──────────────────────────────────────────────────────────────
function EmptyState({ label }: { label: string }) {
  return (
    <div style={{
      padding: '60px 0',
      textAlign: 'center',
      border: '1px dashed var(--border)',
      borderRadius: 'var(--radius)',
    }}>
      <p style={{ fontSize: '12px', color: 'var(--text-ghost)', letterSpacing: '0.06em' }}>
        {label}
      </p>
    </div>
  )
}
