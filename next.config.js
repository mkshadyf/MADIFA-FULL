const withPWA = require('next-pwa')({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
  skipWaiting: true,
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
};

module.exports = withPWA(nextConfig); 