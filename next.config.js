/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'pub-c43a87ca71904e19971c3defec24c598.r2.dev',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      'next/headers': require.resolve('next/headers'),
    }
    return config
  },
  reactStrictMode: true,
  experimental: {
    optimizeCss: true,
    serverComponentsExternalPackages: ['@aws-sdk']
  },
  output: 'standalone',
  api: {
    bodyParser: {
      sizeLimit: '10mb'
    },
    responseLimit: '10mb'
  }
}

module.exports = nextConfig 