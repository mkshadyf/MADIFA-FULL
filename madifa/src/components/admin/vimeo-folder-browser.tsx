

import { useState, useEffect } from 'react'
import { Vimeo } from '@vimeo/vimeo'

interface VimeoFolder {
  uri: string
  name: string
  created_time: string
  modified_time: string
  user: {
    name: string
  }
  metadata: {
    connections: {
      videos: {
        total: number
      }
    }
  }
}

interface VimeoFolderBrowserProps {
  onFolderSelect: (folderId: string) => void
}

export default function VimeoFolderBrowser({ onFolderSelect }: VimeoFolderBrowserProps) {
  const [folders, setFolders] = useState<VimeoFolder[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadFolders()
  }, [])

  const loadFolders = async () => {
    const vimeoClient = new Vimeo(
      process.env.NEXT_PUBLIC_VIMEO_CLIENT_ID!,
      process.env.NEXT_PUBLIC_VIMEO_CLIENT_SECRET!,
      process.env.NEXT_PUBLIC_VIMEO_ACCESS_TOKEN!
    )

    try {
      setLoading(true)
      const response = await new Promise((resolve, reject) => {
        vimeoClient.request({
          method: 'GET',
          path: '/me/folders',
          query: {
            fields: 'uri,name,created_time,modified_time,user,metadata.connections.videos'
          }
        }, (error, result) => {
          if (error) reject(error)
          else resolve(result)
        })
      })

      setFolders((response as any).data)
    } catch (error) {
      console.error('Error loading folders:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Vimeo Folders</h2>
      {loading ? (
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {folders.map((folder) => (
            <div
              key={folder.uri}
              className="bg-gray-800 rounded-lg p-6 shadow-lg"
            >
              <h3 className="text-lg font-semibold text-white mb-2">{folder.name}</h3>
              <div className="text-sm text-gray-400">
                <p>Videos: {folder.metadata.connections.videos.total}</p>
                <p>Created: {new Date(folder.created_time).toLocaleDateString()}</p>
                <p>Modified: {new Date(folder.modified_time).toLocaleDateString()}</p>
              </div>
              <button
                onClick={() => onFolderSelect(folder.uri)}
                className="mt-4 w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                View Videos
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
} 
