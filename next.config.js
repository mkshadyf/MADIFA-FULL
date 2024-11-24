import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import withPWA from 'next-pwa'
import withBundleAnalyzer from '@next/bundle-analyzer'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const pwaConfig = withPWA({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development'
})

const analyzerConfig = withBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true'
})

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'vimeo.com',
      },
      {
        protocol: 'https',
        hostname: 'i.vimeocdn.com',
      },
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      }
    ],
    unoptimized: process.env.NODE_ENV === 'development',
  },
  experimental: {
    serverActions: true,
  },
}

export default analyzerConfig(pwaConfig(nextConfig)) 