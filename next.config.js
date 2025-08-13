/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // Required for Payload CMS
    serverComponentsExternalPackages: ['payload'],
  },
  // Vercel specific optimizations
  images: {
    domains: ['localhost'],
  },
  // API routes configuration
  api: {
    bodyParser: {
      sizeLimit: '1mb',
    },
  },
  // Webpack configuration for Payload
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      payload: require.resolve('payload'),
    }
    return config
  },
}

module.exports = nextConfig
