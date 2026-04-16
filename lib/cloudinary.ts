// This file is used server-side (in the Express backend) only.
// Re-exported here for any Next.js server actions or API routes that may need it.

export const cloudinaryConfig = {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
}
