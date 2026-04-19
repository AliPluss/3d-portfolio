/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
    ],
  },

  // R3F + Drei ship ESM-only packages that Next.js needs to transpile
  transpilePackages: [
    'three',
    '@react-three/fiber',
    '@react-three/drei',
  ],

  webpack(config) {
    // Silence "Critical dependency: the request of a CommonJS require() call
    // is an expression" warnings from Drei internals
    config.module = config.module ?? {}
    config.module.exprContextCritical = false
    return config
  },
}

module.exports = nextConfig
