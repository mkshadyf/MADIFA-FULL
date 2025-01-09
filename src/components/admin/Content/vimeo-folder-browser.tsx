import { Card } from '@/components/ui/card'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { vimeoService } from '@/lib/services/vimeo'
import type { VimeoFolder } from '@/types/vimeo'
import { useEffect, useState } from 'react'

export default function VimeoFolderBrowser() {
  const [folders, setFolders] = useState<VimeoFolder[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null)

  useEffect(() => {
    const loadFolders = async () => {
      try {
        const vimeoFolders = await vimeoService.getFolders()
        setFolders(vimeoFolders)
      } catch (error) {
        console.error('Failed to load folders:', error)
      } finally {
        setLoading(false)
      }
    }

    loadFolders()
  }, [])

  if (loading) return <LoadingSpinner />

  if (folders.length === 0) {
    return (
      <Card className="p-6">
        <p className="text-center text-gray-500">No folders found</p>
      </Card>
    )
  }

  return (
    <Card className="p-6">
      <h2 className="mb-4 text-2xl font-bold">Vimeo Folders</h2>
      <div className="space-y-2">
        {folders.map(folder => (
          <div
            key={folder.uri}
            className={`cursor-pointer rounded-lg p-3 hover:bg-gray-100 ${
              selectedFolder === folder.uri ? 'bg-gray-100' : ''
            }`}
            onClick={() => setSelectedFolder(folder.uri)}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{folder.name}</p>
                <p className="text-sm text-gray-500">
                  {folder.metadata.connections.videos.total} videos
                </p>
              </div>
              <div className="text-sm text-gray-500">
                Last updated:{' '}
                {new Date(folder.modified_time).toLocaleDateString()}
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
