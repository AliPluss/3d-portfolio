require('dotenv').config()
const express  = require('express')
const mongoose = require('mongoose')
const cors     = require('cors')

const authRoutes     = require('./routes/auth')
const postRoutes     = require('./routes/posts')
const projectRoutes  = require('./routes/projects')

const app  = express()
const PORT = process.env.PORT ?? 5000

// ── Middleware ──────────────────────────────────────────────────────────────
app.use(cors({
  origin: [
    'http://localhost:3000',
    process.env.FRONTEND_URL,
  ].filter(Boolean),
  credentials: true,
}))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// ── Health ──────────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => res.json({ ok: true, time: new Date().toISOString() }))

// ── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/auth',     authRoutes)
app.use('/api/posts',    postRoutes)
app.use('/api/projects', projectRoutes)

// ── 404 ──────────────────────────────────────────────────────────────────────
app.use((_req, res) => res.status(404).json({ message: 'Route not found' }))

// ── Error handler ─────────────────────────────────────────────────────────────
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  console.error('[ERROR]', err.message)
  res.status(err.status ?? 500).json({ message: err.message ?? 'Internal server error' })
})

// ── Connect DB, then start ────────────────────────────────────────────────────
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('[DB] MongoDB connected')
    app.listen(PORT, () => console.log(`[SERVER] Running on port ${PORT}`))
  })
  .catch((err) => {
    console.error('[DB] Connection failed:', err.message)
    process.exit(1)
  })
