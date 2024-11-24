'use client'

import { useState } from 'react'
import VimeoFolderBrowser from '@/components/admin/vimeo-folder-browser'
import VimeoContentManager from '@/components/admin/vimeo-content-manager'

export default function VimeoManagementPage() {
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null)

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold mb-8">Vimeo Content Management</h1>
        
        {!selectedFolder ? (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Select a Folder</h2>
            <VimeoFolderBrowser onFolderSelect={setSelectedFolder} />
          </div>
        ) : (
          <div>
            <button
              onClick={() => setSelectedFolder(null)}
              className="mb-4 px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
            >
              ← Back to Folders
            </button>
            <VimeoContentManager folderId={selectedFolder} />
          </div>
        )}
      </div>
    </div>
  )
} 