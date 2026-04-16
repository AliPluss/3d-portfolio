'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  Plus, Trash2, Edit3, X, Upload, LogOut,
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

// ─── Toast helper ─────────────────────────────────────────────────────────────
function Toast({ msg, type }: { msg: string; type: 'ok' | 'err' }) {
  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-xl
      text-sm shadow-xl border
      ${type === 'ok'
        ? 'bg-green-500/15 border-green-500/25 text-green-400'
        : 'bg-red-500/15 border-red-500/25 text-red-400'
      }`}
    >
      {type === 'ok'
        ? <CheckCircle className="w-4 h-4 shrink-0" />
        : <AlertCircle className="w-4 h-4 shrink-0" />}
      {msg}
    </div>
  )
}

// ─── Shared API helper ────────────────────────────────────────────────────────
function useApi() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000'
  const authFetch = useCallback(
    async (path: string, options: RequestInit = {}) => {
      const token = localStorage.getItem('admin_token') ?? ''
      const res = await fetch(`${apiUrl}${path}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
          ...(options.headers ?? {}),
        },
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.message ?? `Request failed: ${res.status}`)
      }
      return res.json()
    },
    [apiUrl]
  )
  return { authFetch, apiUrl }
}

// ═══════════════════════════════════════════════════════════════════════════════
export default function AdminDashboard() {
  const router = useRouter()
  const [tab, setTab] = useState<Tab>('posts')
  const [toast, setToast] = useState<{ msg: string; type: 'ok' | 'err' } | null>(null)

  // Auth guard
  useEffect(() => {
    if (typeof window !== 'undefined' && !localStorage.getItem('admin_token')) {
      router.replace('/admin')
    }
  }, [router])

  const showToast = (msg: string, type: 'ok' | 'err') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  const handleLogout = () => {
    localStorage.removeItem('admin_token')
    router.replace('/admin')
  }

  return (
    <main className="min-h-screen pt-20 pb-24 px-6 md:px-10 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-xs text-white/30 mt-1">Manage your content</p>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-xs text-white/30 hover:text-white/70 transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" /> Sign out
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-8 p-1 rounded-xl bg-white/[0.04] w-fit border border-white/[0.06]">
        {(['posts', 'projects'] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-5 py-2 rounded-lg text-xs tracking-widest uppercase transition-colors
              ${tab === t ? 'bg-white text-black' : 'text-white/40 hover:text-white/70'}`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Panels */}
      {tab === 'posts'    && <PostsPanel    showToast={showToast} />}
      {tab === 'projects' && <ProjectsPanel showToast={showToast} />}

      {toast && <Toast {...toast} />}
    </main>
  )
}

// ─── Posts Panel ──────────────────────────────────────────────────────────────
function PostsPanel({ showToast }: { showToast: (m: string, t: 'ok' | 'err') => void }) {
  const { authFetch } = useApi()
  const [posts, setPosts]       = useState<Post[]>([])
  const [loading, setLoading]   = useState(true)
  const [editing, setEditing]   = useState<Partial<Post> | null>(null)
  const [saving, setSaving]     = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try { setPosts(await authFetch('/api/posts')) }
    catch { showToast('Failed to load posts', 'err') }
    finally { setLoading(false) }
  }, [authFetch, showToast])

  useEffect(() => { load() }, [load])

  const save = async () => {
    if (!editing) return
    setSaving(true)
    try {
      if (editing._id) {
        await authFetch(`/api/posts/${editing._id}`, { method: 'PUT', body: JSON.stringify(editing) })
      } else {
        await authFetch('/api/posts', { method: 'POST', body: JSON.stringify(editing) })
      }
      showToast('Saved!', 'ok')
      setEditing(null)
      load()
    } catch (e) {
      showToast((e as Error).message, 'err')
    } finally {
      setSaving(false)
    }
  }

  const remove = async (id: string) => {
    if (!confirm('Delete this post?')) return
    try {
      await authFetch(`/api/posts/${id}`, { method: 'DELETE' })
      showToast('Deleted', 'ok')
      load()
    } catch (e) {
      showToast((e as Error).message, 'err')
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <p className="text-xs text-white/30">{posts.length} posts</p>
        <button
          onClick={() => setEditing({ title: '', excerpt: '', body: '', thumbnail: '', slug: '' })}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-black text-xs font-semibold"
        >
          <Plus className="w-3.5 h-3.5" /> New Post
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-5 h-5 animate-spin text-white/30" /></div>
      ) : (
        <div className="flex flex-col gap-2">
          {posts.map((post) => (
            <div key={post._id}
              className="flex items-center justify-between p-4 rounded-xl
                         bg-white/[0.03] border border-white/[0.07] hover:border-white/15 transition-colors"
            >
              <div className="flex flex-col gap-0.5 min-w-0">
                <span className="text-sm text-white truncate">{post.title}</span>
                <span className="text-[11px] text-white/30">
                  {new Date(post.date).toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center gap-2 ml-4 shrink-0">
                <button onClick={() => setEditing(post)} className="p-2 text-white/30 hover:text-white transition-colors">
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => remove(post._id)} className="p-2 text-white/30 hover:text-red-400 transition-colors">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
          {posts.length === 0 && (
            <p className="text-center text-white/20 text-sm py-16">No posts yet.</p>
          )}
        </div>
      )}

      {/* Modal */}
      {editing && (
        <Modal title={editing._id ? 'Edit Post' : 'New Post'} onClose={() => setEditing(null)}>
          <Field label="Title">
            <input className={inputCls} value={editing.title ?? ''} onChange={(e) => setEditing(p => ({ ...p, title: e.target.value }))} />
          </Field>
          <Field label="Slug">
            <input className={inputCls} value={editing.slug ?? ''} onChange={(e) => setEditing(p => ({ ...p, slug: e.target.value }))} />
          </Field>
          <Field label="Excerpt">
            <textarea rows={2} className={inputCls} value={editing.excerpt ?? ''} onChange={(e) => setEditing(p => ({ ...p, excerpt: e.target.value }))} />
          </Field>
          <Field label="Body (Markdown)">
            <textarea rows={8} className={inputCls} value={editing.body ?? ''} onChange={(e) => setEditing(p => ({ ...p, body: e.target.value }))} />
          </Field>
          <Field label="Thumbnail URL">
            <input className={inputCls} placeholder="https://res.cloudinary.com/..." value={editing.thumbnail ?? ''} onChange={(e) => setEditing(p => ({ ...p, thumbnail: e.target.value }))} />
          </Field>
          <ModalActions onClose={() => setEditing(null)} onSave={save} saving={saving} />
        </Modal>
      )}
    </div>
  )
}

// ─── Projects Panel ───────────────────────────────────────────────────────────
function ProjectsPanel({ showToast }: { showToast: (m: string, t: 'ok' | 'err') => void }) {
  const { authFetch } = useApi()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading]   = useState(true)
  const [editing, setEditing]   = useState<Partial<Project> | null>(null)
  const [saving, setSaving]     = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try { setProjects(await authFetch('/api/projects')) }
    catch { showToast('Failed to load projects', 'err') }
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
      if (editing._id) {
        await authFetch(`/api/projects/${editing._id}`, { method: 'PUT', body: JSON.stringify(payload) })
      } else {
        await authFetch('/api/projects', { method: 'POST', body: JSON.stringify(payload) })
      }
      showToast('Saved!', 'ok')
      setEditing(null)
      load()
    } catch (e) {
      showToast((e as Error).message, 'err')
    } finally {
      setSaving(false)
    }
  }

  const remove = async (id: string) => {
    if (!confirm('Delete this project?')) return
    try {
      await authFetch(`/api/projects/${id}`, { method: 'DELETE' })
      showToast('Deleted', 'ok')
      load()
    } catch (e) {
      showToast((e as Error).message, 'err')
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <p className="text-xs text-white/30">{projects.length} projects</p>
        <button
          onClick={() => setEditing({ title: '', description: '', image: '', link: '', github: '', tags: '' })}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-black text-xs font-semibold"
        >
          <Plus className="w-3.5 h-3.5" /> New Project
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-5 h-5 animate-spin text-white/30" /></div>
      ) : (
        <div className="flex flex-col gap-2">
          {projects.map((project) => (
            <div key={project._id}
              className="flex items-center justify-between p-4 rounded-xl
                         bg-white/[0.03] border border-white/[0.07] hover:border-white/15 transition-colors"
            >
              <span className="text-sm text-white truncate">{project.title}</span>
              <div className="flex items-center gap-2 ml-4 shrink-0">
                <button onClick={() => setEditing({ ...project, tags: Array.isArray(project.tags) ? (project.tags as unknown as string[]).join(', ') : project.tags })}
                  className="p-2 text-white/30 hover:text-white transition-colors">
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => remove(project._id)} className="p-2 text-white/30 hover:text-red-400 transition-colors">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
          {projects.length === 0 && (
            <p className="text-center text-white/20 text-sm py-16">No projects yet.</p>
          )}
        </div>
      )}

      {editing && (
        <Modal title={editing._id ? 'Edit Project' : 'New Project'} onClose={() => setEditing(null)}>
          <Field label="Title">
            <input className={inputCls} value={editing.title ?? ''} onChange={(e) => setEditing(p => ({ ...p, title: e.target.value }))} />
          </Field>
          <Field label="Description">
            <textarea rows={4} className={inputCls} value={editing.description ?? ''} onChange={(e) => setEditing(p => ({ ...p, description: e.target.value }))} />
          </Field>
          <Field label="Image URL">
            <input className={inputCls} placeholder="https://res.cloudinary.com/..." value={editing.image ?? ''} onChange={(e) => setEditing(p => ({ ...p, image: e.target.value }))} />
          </Field>
          <Field label="Live URL">
            <input className={inputCls} value={editing.link ?? ''} onChange={(e) => setEditing(p => ({ ...p, link: e.target.value }))} />
          </Field>
          <Field label="GitHub URL (optional)">
            <input className={inputCls} value={editing.github ?? ''} onChange={(e) => setEditing(p => ({ ...p, github: e.target.value }))} />
          </Field>
          <Field label="Tags (comma-separated)">
            <input className={inputCls} placeholder="Three.js, React, Node.js" value={editing.tags ?? ''} onChange={(e) => setEditing(p => ({ ...p, tags: e.target.value }))} />
          </Field>
          <ModalActions onClose={() => setEditing(null)} onSave={save} saving={saving} />
        </Modal>
      )}
    </div>
  )
}

// ─── Shared UI helpers ────────────────────────────────────────────────────────
const inputCls = `w-full px-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08]
  text-sm text-white placeholder-white/20
  focus:outline-none focus:border-white/25 transition-colors resize-none`

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[11px] uppercase tracking-widest text-white/30">{label}</label>
      {children}
    </div>
  )
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl bg-[#0d0d0d] border border-white/[0.08]
                      shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Modal header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
          <h2 className="text-sm font-semibold text-white">{title}</h2>
          <button onClick={onClose} className="p-1 text-white/30 hover:text-white transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
        {/* Modal body */}
        <div className="flex flex-col gap-4 p-6 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  )
}

function ModalActions({
  onClose, onSave, saving,
}: { onClose: () => void; onSave: () => void; saving: boolean }) {
  return (
    <div className="flex gap-3 pt-2">
      <button
        type="button"
        onClick={onClose}
        className="flex-1 py-2.5 rounded-xl border border-white/[0.08] text-sm text-white/50
                   hover:text-white/80 hover:border-white/20 transition-colors"
      >
        Cancel
      </button>
      <button
        type="button"
        onClick={onSave}
        disabled={saving}
        className="flex-1 py-2.5 rounded-xl bg-white text-black text-sm font-semibold
                   hover:bg-white/90 transition-colors disabled:opacity-50"
      >
        {saving ? <span className="flex items-center justify-center gap-2">
          <Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving…
        </span> : 'Save'}
      </button>
    </div>
  )
}

// Suppress TS unused import warning for Upload icon
void Upload
