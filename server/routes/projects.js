const express    = require('express')
const cloudinary = require('cloudinary').v2
const multer     = require('multer')
const stream     = require('stream')
const Project    = require('../models/Project')
const requireAuth = require('../middleware/auth')

const router = express.Router()

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } })

function uploadToCloudinary(buffer, folder) {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder, resource_type: 'image' },
      (error, result) => {
        if (error) reject(error)
        else resolve(result)
      }
    )
    const readable = new stream.PassThrough()
    readable.end(buffer)
    readable.pipe(uploadStream)
  })
}

// ── GET /api/projects ──────────────────────────────────────────────────────
router.get('/', async (_req, res) => {
  try {
    const projects = await Project.find().sort({ order: 1, createdAt: -1 })
    res.json(projects)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// ── GET /api/projects/:id ──────────────────────────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
    if (!project) return res.status(404).json({ message: 'Project not found' })
    res.json(project)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// ── POST /api/projects ─────────────────────────────────────────────────────
router.post('/', requireAuth, async (req, res) => {
  try {
    const project = new Project(req.body)
    await project.save()
    res.status(201).json(project)
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
})

// ── PUT /api/projects/:id ──────────────────────────────────────────────────
router.put('/:id', requireAuth, async (req, res) => {
  try {
    const project = await Project.findByIdAndUpdate(req.params.id, req.body, {
      new: true, runValidators: true,
    })
    if (!project) return res.status(404).json({ message: 'Project not found' })
    res.json(project)
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
})

// ── DELETE /api/projects/:id ───────────────────────────────────────────────
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id)
    if (!project) return res.status(404).json({ message: 'Project not found' })
    res.json({ message: 'Deleted' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// ── POST /api/projects/upload/image ───────────────────────────────────────
router.post('/upload/image', requireAuth, upload.single('image'), async (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No file uploaded' })
  try {
    const result = await uploadToCloudinary(req.file.buffer, 'portfolio/projects')
    res.json({ url: result.secure_url })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

module.exports = router
