import { useState } from 'react'

import VimeoAnalytics from '@/components/admin/vimeo-analytics'
import VimeoShowcaseCreator from '@/components/admin/vimeo-showcase-creator'
import VimeoShowcaseManager from '@/components/admin/vimeo-showcase-manager'
import VimeoUpload from '@/components/admin/vimeo-upload'

type ActiveView = 'upload' | 'showcases' | 'analytics'

export default function VimeoManagePage() {
  const [activeView, setActiveView] = useState<ActiveView>('upload')

  return (
    <div className="min-h-screen bg-gray-900">
      <nav className="border-b border-gray-700 bg-gray-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 justify-between">
            <div className="flex">
              <div className="flex space-x-8">
                <button
                  onClick={() => setActiveView('upload')}
                  className={`inline-flex items-center px-1 pt-1 text-sm font-medium ${
                    activeView === 'upload'
                      ? 'border-b-2 border-indigo-500 text-white'
                      : 'text-gray-300 hover:text-white'
                  }`}
                >
                  Upload
                </button>
                <button
                  onClick={() => setActiveView('showcases')}
                  className={`inline-flex items-center px-1 pt-1 text-sm font-medium ${
                    activeView === 'showcases'
                      ? 'border-b-2 border-indigo-500 text-white'
                      : 'text-gray-300 hover:text-white'
                  }`}
                >
                  Showcases
                </button>
                <button
                  onClick={() => setActiveView('analytics')}
                  className={`inline-flex items-center px-1 pt-1 text-sm font-medium ${
                    activeView === 'analytics'
                      ? 'border-b-2 border-indigo-500 text-white'
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

      <main className="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">
        {activeView === 'upload' && (
          <div className="px-4 py-6 sm:px-0">
            <VimeoUpload />
          </div>
        )}

        {activeView === 'showcases' && (
          <div className="space-y-6 px-4 py-6 sm:px-0">
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
