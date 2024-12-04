import React from 'react'
import { useVimeoContent } from '@/hooks/useVimeoContent'
import { vimeoService } from '@/lib/services/vimeo'
import { useQuery } from '@tanstack/react-query'
import LoadingState from '@/components/ui/loading-state'

export default function VimeoManagement() {
  const [selectedFolder, setSelectedFolder] = React.useState<string>('')
  const { data: folders, isLoading: foldersLoading } = useQuery({
    queryKey: ['vimeo-folders'],
    queryFn: () => vimeoService.getFolders()
  })

  const { data: videos, isLoading: videosLoading } = useQuery({
    queryKey: ['vimeo-videos', selectedFolder],
    queryFn: () => vimeoService.getVideosByFolder(selectedFolder),
    enabled: !!selectedFolder
  })

  if (foldersLoading) return <LoadingState />

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Content Management</h1>
        <button
          onClick={() => {/* Add new folder/video */}}
          className="btn-primary"
        >
          Add New
        </button>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Folders sidebar */}
        <div className="col-span-3 bg-gray-800 p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-4">Folders</h2>
          <ul className="space-y-2">
            {folders?.map((folder) => (
              <li
                key={folder.uri}
                className={`cursor-pointer p-2 rounded ${
                  selectedFolder === folder.uri
                    ? 'bg-indigo-600'
                    : 'hover:bg-gray-700'
                }`}
                onClick={() => setSelectedFolder(folder.uri)}
              >
                {folder.name}
              </li>
            ))}
          </ul>
        </div>

        {/* Videos grid */}
        <div className="col-span-9">
          {videosLoading ? (
            <LoadingState />
          ) : (
            <div className="grid grid-cols-3 gap-6">
              {videos?.map((video) => (
                <div
                  key={video.uri}
                  className="bg-gray-800 rounded-lg overflow-hidden"
                >
                  <img
                    src={video.pictures.sizes[0].link}
                    alt={video.name}
                    className="w-full aspect-video object-cover"
                  />
                  <div className="p-4">
                    <h3 className="font-semibold">{video.name}</h3>
                    <p className="text-sm text-gray-400">
                      {video.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 