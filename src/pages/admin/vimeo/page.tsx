import React from "react"
import { useState } from 'react'

import VimeoContentManager from '@/components/admin/vimeo-content-manager'
import VimeoFolderBrowser from '@/components/admin/vimeo-folder-browser'

export default function VimeoManagementPage() {
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null)

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="mb-8 text-3xl font-bold">Vimeo Content Management</h1>

        {!selectedFolder ? (
          <div className="mb-8">
            <h2 className="mb-4 text-xl font-semibold">Select a Folder</h2>
            <VimeoFolderBrowser onFolderSelect={setSelectedFolder} />
          </div>
        ) : (
          <div>
            <button
              onClick={() => setSelectedFolder(null)}
              className="mb-4 rounded-lg bg-gray-700 px-4 py-2 transition-colors hover:bg-gray-600"
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
