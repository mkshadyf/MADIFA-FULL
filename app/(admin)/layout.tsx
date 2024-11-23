import { headers } from 'next/headers'
import { createServerClient } from '@/lib/supabase/client'
import { redirect } from 'next/navigation'
import type { ReactNode } from 'react'

async function getUser() {
  const supabase = createServerClient()
  
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session?.user) {
    redirect('/signin')
  }

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('user_id', session.user.id)
    .single()

  if (!profile || profile.role !== 'admin') {
    redirect('/browse')
  }

  return { user: session.user, profile }
}

export default async function AdminLayout({
  children,
}: {
  children: ReactNode
}) {
  const { user, profile } = await getUser()

  return (
    <div className="min-h-screen bg-gray-900">
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <div className="text-xl font-bold text-white">
                Madifa Admin
              </div>
              <nav className="ml-10">
                <div className="flex items-center space-x-4">
                  <a
                    href="/admin/dashboard"
                    className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Dashboard
                  </a>
                  <a
                    href="/admin/content"
                    className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Content
                  </a>
                  <a
                    href="/admin/users"
                    className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Users
                  </a>
                  <a
                    href="/admin/analytics"
                    className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Analytics
                  </a>
                </div>
              </nav>
            </div>
            <div className="flex items-center">
              <div className="text-gray-300">
                {profile.full_name}
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  )
} 