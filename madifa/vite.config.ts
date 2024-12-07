/// <reference types="vite/client" />
/// <reference types="vitest" />
import { sentryVitePlugin } from '@sentry/vite-plugin'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath } from 'url'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// CSP Configuration
const CSP = {
  'default-src': ["'self'"],
  'script-src': ["'self'", "'unsafe-inline'", "'unsafe-eval'", 'https://player.vimeo.com'],
  'style-src': ["'self'", "'unsafe-inline'"],
  'img-src': ["'self'", 'data:', 'https:', 'blob:'],
  'media-src': ["'self'", 'https:', 'blob:'],
  'connect-src': [
    "'self'",
    'https://api.vimeo.com',
    'https://player.vimeo.com',
    'https://*.supabase.co',
    'wss://*.supabase.co',
    'https://*.sentry.io'
  ],
  'frame-src': ["'self'", 'https://player.vimeo.com'],
  'worker-src': ["'self'", 'blob:'],
  'font-src': ["'self'", 'data:'],
  'object-src': ["'none'"],
  'base-uri': ["'self'"]
}

const generateCSP = () => {
  return Object.entries(CSP)
    .map(([key, values]) => `${key} ${values.join(' ')}`)
    .join('; ')
}

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'service-worker.ts',
      registerType: 'autoUpdate',
      manifest: {
        name: 'Madifa',
        short_name: 'Madifa',
        description: 'Your premium video streaming platform',
        theme_color: '#4F46E5',
        background_color: '#111827',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: '/icons/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: '/icons/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}']
      },
      devOptions: {
        enabled: true,
        type: 'module'
      }
    }),
    sentryVitePlugin({
      org: 'madifa',
      project: 'madifa-web',
      authToken: process.env.SENTRY_AUTH_TOKEN,
      sourcemaps: {
        assets: './dist/**',
      },
    })
  ],
  server: {
    port: 3000,
    strictPort: false,
    host: true,
    watch: {
      usePolling: true,
      interval: 100
    },
    open: true,
    cors: true,
    headers: {
      'Content-Security-Policy': generateCSP(),
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'camera=(), microphone=(), geolocation=()'
    }
  },
  preview: {
    port: 3000,
    host: true,
    strictPort: true,
    headers: {
      'Content-Security-Policy': generateCSP(),
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'camera=(), microphone=(), geolocation=()'
    }
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'src/test/setup.ts']
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  build: {
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          vimeo: ['@vimeo/player', '@vimeo/vimeo'],
          ui: ['@headlessui/react', 'framer-motion'],
          charts: ['d3', 'recharts'],
          utils: ['class-variance-authority', 'clsx', 'tailwind-merge']
        }
      }
    }
  }
})
