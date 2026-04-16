const express    = require('express')
const cloudinary = require('cloudinary').v2
const multer     = require('multer')
const stream     = require('stream')
const Post       = require('../models/Post')
const requireAuth = require('../middleware/auth')

const router = express.Router()

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

// Memory storage — we stream directly to Cloudinary
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

// ── GET /api/posts ─────────────────────────────────────────────────────────
router.get('/', async (_req, res) => {
  try {
    const posts = await Post.find({ published: true })
      .sort({ date: -1 })
      .select('-body')
    res.json(posts)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// ── GET /api/posts/:idOrSlug ───────────────────────────────────────────────
router.get('/:idOrSlug', async (req, res) => {
  try {
    const { idOrSlug } = req.params
    const post = await Post.findOne(
      /^[0-9a-fA-F]{24}$/.test(idOrSlug)
        ? { _id: idOrSlug }
        : { slug: idOrSlug }
    )
    if (!post) return res.status(404).json({ message: 'Post not found' })
    res.json(post)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// ── POST /api/posts ────────────────────────────────────────────────────────
router.post('/', requireAuth, async (req, res) => {
  try {
    const post = new Post(req.body)
    await post.save()
    res.status(201).json(post)
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
})

// ── PUT /api/posts/:id ─────────────────────────────────────────────────────
router.put('/:id', requireAuth, async (req, res) => {
  try {
    const post = await Post.findByIdAndUpdate(req.params.id, req.body, {
      new: true, runValidators: true,
    })
    if (!post) return res.status(404).json({ message: 'Post not found' })
    res.json(post)
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
})

// ── DELETE /api/posts/:id ──────────────────────────────────────────────────
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const post = await Post.findByIdAndDelete(req.params.id)
    if (!post) return res.status(404).json({ message: 'Post not found' })
    res.json({ message: 'Deleted' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// ── POST /api/posts/upload/image ───────────────────────────────────────────
router.post('/upload/image', requireAuth, upload.single('image'), async (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No file uploaded' })
  try {
    const result = await uploadToCloudinary(req.file.buffer, 'portfolio/posts')
    res.json({ url: result.secure_url })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

module.exports = router
