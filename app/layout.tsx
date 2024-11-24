import { Suspense } from 'react'
import { Providers } from '@/components/providers'
import { LoadingSpinner } from '@/components/ui/loading'
import { createClient } from '@/lib/supabase/server'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'MADIFA - Premium Streaming Platform',
  description: 'Your premium video streaming platform for African content',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  let session = null

  try {
    const supabase = createClient()
    const { data } = await supabase.auth.getSession()
    session = data.session
  } catch (error) {
    console.error('Error getting session:', error)
  }

  return (
    <html lang="en" className={inter.className}>
      <body className="min-h-screen bg-[rgb(var(--background))]">
        <Providers>
          <Suspense fallback={<LoadingSpinner />}>
            {children}
          </Suspense>
        </Providers>
      </body>
    </html>
  )
} 