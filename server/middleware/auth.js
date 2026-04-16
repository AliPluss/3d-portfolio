const jwt = require('jsonwebtoken')

module.exports = function requireAuth(req, res, next) {
  const authHeader = req.headers['authorization']
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided' })
  }

  const token = authHeader.slice(7)
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET)
    req.user = payload
    next()
  } catch {
    return res.status(401).json({ message: 'Invalid or expired token' })
  }
}
