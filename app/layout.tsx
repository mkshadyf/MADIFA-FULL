import { Inter } from 'next/font/google'
import './globals.css'
import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { AuthProvider } from '@/components/providers/AuthProvider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Madifa - Modern African Streaming',
  description: 'Stream the best African content in HD quality',
  manifest: '/manifest.json',
  themeColor: '#111827',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
    viewportFit: 'cover'
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Madifa',
    startupImage: [
      {
        url: '/splash/iphone5.png',
        media: '(device-width: 320px) and (device-height: 568px)'
      },
      {
        url: '/splash/iphone6.png',
        media: '(device-width: 375px) and (device-height: 667px)'
      },
      {
        url: '/splash/iphoneplus.png',
        media: '(device-width: 621px) and (device-height: 1104px)'
      },
      {
        url: '/splash/iphonex.png',
        media: '(device-width: 375px) and (device-height: 812px)'
      },
      {
        url: '/splash/iphonexr.png',
        media: '(device-width: 414px) and (device-height: 896px)'
      },
      {
        url: '/splash/ipad.png',
        media: '(device-width: 768px) and (device-height: 1024px)'
      },
      {
        url: '/splash/ipadpro1.png',
        media: '(device-width: 834px) and (device-height: 1112px)'
      },
      {
        url: '/splash/ipadpro2.png',
        media: '(device-width: 834px) and (device-height: 1194px)'
      },
      {
        url: '/splash/ipadpro3.png',
        media: '(device-width: 1024px) and (device-height: 1366px)'
      }
    ]
  },
  formatDetection: {
    telephone: false
  },
  applicationName: 'Madifa',
  other: {
    'mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'black-translucent',
    'msapplication-TileColor': '#111827',
    'msapplication-config': '/browserconfig.xml'
  }
}

interface RootLayoutProps {
  children: ReactNode
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className={`${inter.className} h-full overflow-x-hidden bg-gray-900 text-white`}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
} 