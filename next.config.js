/** @type {import('next').NextConfig} */
const nextConfig = {
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
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        pathname: '/a/**',
      },
      {
        protocol: 'https',
        hostname: 'pub-c43a87ca71904e19971c3defec24c598.r2.dev',
        pathname: '/**',
      },
    ],
  },
}

module.exports = nextConfig 