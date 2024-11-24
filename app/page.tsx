import { Suspense } from 'react'
import CategoryBrowser from '@/components/content/CategoryBrowser'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function HomePage() {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()

  // If not logged in, show landing page
  if (!session) {
    return (
      <div className="min-h-screen bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              Welcome to Madifa
            </h1>
            <p className="mt-3 text-xl text-gray-400 sm:mt-4">
              Your premium video streaming platform
            </p>
            <div className="mt-8">
              <a
                href="/signin"
                className="inline-block rounded-md border border-transparent bg-indigo-600 px-8 py-3 text-base font-medium text-white hover:bg-indigo-700"
              >
                Get Started
              </a>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // If logged in, redirect to browse page
  redirect('/browse')
} 