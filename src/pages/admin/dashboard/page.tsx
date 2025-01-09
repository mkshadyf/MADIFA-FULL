import VimeoAnalytics from '@/components/admin/Analytics/vimeo-analytics'
import VimeoContentManager from '@/components/admin/Vimeo/vimeo-content-manager'
import VimeoMetadataEditor from '@/components/admin/Vimeo/vimeo-metadata-editor'
import VimeoShowcaseManager from '@/components/admin/Vimeo/vimeo-showcase-manager'
import type { VimeoVideo } from '@/types/vimeo'
import { useState } from 'react'

type ActiveView = 'content' | 'showcases' | 'analytics' | 'metadata'

export default function AdminDashboard() {
  const [activeView, setActiveView] = useState<ActiveView>('content')
  const [selectedVideo, setSelectedVideo] = useState<VimeoVideo | null>(null)

  const handleVideoSelect = (video: VimeoVideo) => {
    setSelectedVideo(video)
    setActiveView('metadata')
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <nav className="border-b border-gray-700 bg-gray-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 justify-between">
            <div className="flex">
              <div className="flex space-x-8">
                <button
                  onClick={() => setActiveView('content')}
                  className={`inline-flex items-center px-1 pt-1 text-sm font-medium ${
                    activeView === 'content'
                      ? 'border-b-2 border-indigo-500 text-white'
                      : 'text-gray-300 hover:text-white'
                  }`}
                >
                  Content
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
        {activeView === 'content' && (
          <div className="px-4 py-6 sm:px-0">
            <VimeoContentManager onVideoSelect={handleVideoSelect} />
          </div>
        )}

        {activeView === 'showcases' && (
          <div className="px-4 py-6 sm:px-0">
            <VimeoShowcaseManager />
          </div>
        )}

        {activeView === 'analytics' && (
          <div className="px-4 py-6 sm:px-0">
            {selectedVideo ? <VimeoAnalytics video={selectedVideo} /> : <div>No video selected</div>}
          </div>
        )}

        {activeView === 'metadata' && selectedVideo ? (
          <div className="px-4 py-6 sm:px-0">
            <button
              onClick={() => {
                setSelectedVideo(null)
                setActiveView('content')
              }}
              className="mb-4 rounded-lg bg-gray-700 px-4 py-2 hover:bg-gray-600"
            >
              ← Back to Content
            </button>
            <VimeoMetadataEditor
              video={selectedVideo}
              onUpdate={() => {
                setSelectedVideo(null)
                setActiveView('content')
              }}
            />
          </div>
        ) : null}
      </main>
    </div>
  )
}
