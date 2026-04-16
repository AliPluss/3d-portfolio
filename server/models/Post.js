const mongoose = require('mongoose')

const postSchema = new mongoose.Schema(
  {
    title:     { type: String, required: true, trim: true },
    slug:      { type: String, required: true, unique: true, lowercase: true, trim: true },
    excerpt:   { type: String, default: '' },
    body:      { type: String, default: '' },
    thumbnail: { type: String, default: '' },   // Cloudinary URL
    date:      { type: Date,   default: Date.now },
    published: { type: Boolean, default: true },
  },
  { timestamps: true }
)

// Auto-generate slug from title if not provided
postSchema.pre('validate', function (next) {
  if (!this.slug && this.title) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
  }
  next()
})

module.exports = mongoose.model('Post', postSchema)
