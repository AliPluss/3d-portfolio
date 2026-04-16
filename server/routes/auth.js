const express = require('express')
const jwt     = require('jsonwebtoken')
const User    = require('../models/User')

const router = express.Router()

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password required' })
    }

    const user = await User.findOne({ email })
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' })
    }

    const valid = await user.comparePassword(password)
    if (!valid) {
      return res.status(401).json({ message: 'Invalid credentials' })
    }

    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )

    res.json({ token, email: user.email })
  } catch (err) {
    console.error('[AUTH]', err.message)
    res.status(500).json({ message: 'Server error' })
  }
})

// POST /api/auth/register  (run once to create the admin user — disable after use)
router.post('/register', async (req, res) => {
  try {
    const { email, password, secret } = req.body

    // Simple guard — set a REGISTER_SECRET env var and require it here
    if (secret !== process.env.REGISTER_SECRET) {
      return res.status(403).json({ message: 'Forbidden' })
    }

    const exists = await User.findOne({ email })
    if (exists) return res.status(409).json({ message: 'User already exists' })

    const user = new User({ email, passwordHash: password })
    await user.save()

    res.status(201).json({ message: 'Admin user created' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

module.exports = router
