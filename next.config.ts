import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  distDir: process.env.NODE_ENV === 'development' ? '.next-dev' : '.next',
  images: {
    unoptimized: false,
  },
  // Next.js 15: serverComponentsExternalPackages 已提升为顶层配置
  serverExternalPackages: ['pg', 'sharp', 'exifr'],
}

export default nextConfig
