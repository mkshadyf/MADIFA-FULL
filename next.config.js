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
  reactStrictMode: true,
  images: {
    domains: ['vimeo.com', 'i.vimeocdn.com'],
  },
  server: {
    https: process.env.NODE_ENV === 'development' && 
      fs.existsSync(path.join(__dirname, 'localhost-key.pem')) &&
      fs.existsSync(path.join(__dirname, 'localhost.pem'))
      ? {
          key: fs.readFileSync(path.join(__dirname, 'localhost-key.pem')),
          cert: fs.readFileSync(path.join(__dirname, 'localhost.pem')),
        }
      : undefined,
  },
}

export default analyzerConfig(pwaConfig(nextConfig)) 