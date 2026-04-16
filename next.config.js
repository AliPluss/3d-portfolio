/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'res.cloudinary.com' },
    ],
  },
  // Allow three/addons sub-path imports
  transpilePackages: [],
}

module.exports = nextConfig
