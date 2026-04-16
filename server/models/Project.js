const mongoose = require('mongoose')

const projectSchema = new mongoose.Schema(
  {
    title:       { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    image:       { type: String, default: '' },   // Cloudinary URL
    link:        { type: String, default: '' },
    github:      { type: String, default: '' },
    tags:        { type: [String], default: [] },
    order:       { type: Number, default: 0 },     // manual sort order
    featured:    { type: Boolean, default: false },
  },
  { timestamps: true }
)

module.exports = mongoose.model('Project', projectSchema)
