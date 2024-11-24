const withPWA = require('next-pwa')({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
  skipWaiting: true,
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/stream\.madifa\.co\.za\/.*/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'video-cache',
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
        }
      }
    },
    {
      urlPattern: /^https:\/\/r2\.madifa\.co\.za\/.*/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'image-cache',
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 60 * 60 * 24 * 7 // 7 days
        }
      }
    }
  ]
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'your-supabase-project.supabase.co',
      'r2.madifa.co.za',
      'stream.madifa.co.za'
    ],
  },
  experimental: {
    optimizeCss: true,
    scrollRestoration: true
  }
};

module.exports = withPWA(nextConfig); 