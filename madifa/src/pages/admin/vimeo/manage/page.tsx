

import { useState } from 'react'
import VimeoUpload from '@/components/admin/vimeo-upload'
import VimeoShowcaseCreator from '@/components/admin/vimeo-showcase-creator'
import VimeoShowcaseManager from '@/components/admin/vimeo-showcase-manager'
import VimeoAnalytics from '@/components/admin/vimeo-analytics'

type ActiveView = 'upload' | 'showcases' | 'analytics'

export default function VimeoManagePage() {
  const [activeView, setActiveView] = useState<ActiveView>('upload')

  return (
    <div className="min-h-screen bg-gray-900">
      <nav className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex space-x-8">
                <button
                  onClick={() => setActiveView('upload')}
                  className={`inline-flex items-center px-1 pt-1 text-sm font-medium ${
                    activeView === 'upload'
                      ? 'text-white border-b-2 border-indigo-500'
                      : 'text-gray-300 hover:text-white'
                  }`}
                >
                  Upload
                </button>
                <button
                  onClick={() => setActiveView('showcases')}
                  className={`inline-flex items-center px-1 pt-1 text-sm font-medium ${
                    activeView === 'showcases'
                      ? 'text-white border-b-2 border-indigo-500'
                      : 'text-gray-300 hover:text-white'
                  }`}
                >
                  Showcases
                </button>
                <button
                  onClick={() => setActiveView('analytics')}
                  className={`inline-flex items-center px-1 pt-1 text-sm font-medium ${
                    activeView === 'analytics'
                      ? 'text-white border-b-2 border-indigo-500'
                      : 'text-gray-300 hover:text-white'
                  }`}
                >
                  Analytics
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {activeView === 'upload' && (
          <div className="px-4 py-6 sm:px-0">
            <VimeoUpload />
          </div>
        )}

        {activeView === 'showcases' && (
          <div className="px-4 py-6 sm:px-0 space-y-6">
            <VimeoShowcaseCreator />
            <VimeoShowcaseManager />
          </div>
        )}

        {activeView === 'analytics' && (
          <div className="px-4 py-6 sm:px-0">
            <VimeoAnalytics />
          </div>
        )}
      </main>
    </div>
  )
} 
