import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { useToast } from '@/hooks/useToast'
import { vimeoService } from '@/lib/services/vimeo/vimeo-service'
import type { VimeoFolder } from '@/types/vimeo'
import { FolderIcon, PlusIcon, XCircleIcon } from 'lucide-react'
import { useEffect, useState } from 'react'

interface FolderBrowserProps {
  onFolderSelect?: (folderId: string) => void
  allowCreate?: boolean
  className?: string
}

/**
 * Component for browsing and managing Vimeo folders
 */
export function FolderBrowser({
  onFolderSelect,
  allowCreate = true,
  className = '',
}: FolderBrowserProps) {
  const [folders, setFolders] = useState<VimeoFolder[]>([])
  const [loading, setLoading] = useState(true)
  const [newFolderName, setNewFolderName] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null)
  const { showToast } = useToast()

  useEffect(() => {
    loadFolders()
  }, [])

  const loadFolders = async () => {
    try {
      setLoading(true)
      const folderList = await vimeoService.getFolders()
      setFolders(folderList)
    } catch (error) {
      console.error('Error loading folders:', error)
      showToast('Failed to load folders', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) {
      showToast('Please enter a folder name', 'error')
      return
    }

    try {
      setIsCreating(true)
      const newFolder = await vimeoService.createFolder(newFolderName)
      setFolders([...folders, newFolder])
      setNewFolderName('')
      showToast('Folder created successfully', 'success')
    } catch (error) {
      console.error('Error creating folder:', error)
      showToast('Failed to create folder', 'error')
    } finally {
      setIsCreating(false)
    }
  }

  const handleDeleteFolder = async (folderId: string) => {
    if (window.confirm('Are you sure you want to delete this folder?')) {
      try {
        await vimeoService.deleteFolder(folderId)
        setFolders(folders.filter(folder => folder.uri !== `/folders/${folderId}`))
        showToast('Folder deleted successfully', 'success')
        if (selectedFolderId === folderId) {
          setSelectedFolderId(null)
        }
      } catch (error) {
        console.error('Error deleting folder:', error)
        showToast('Failed to delete folder', 'error')
      }
    }
  }

  const handleFolderSelect = (folderId: string) => {
    setSelectedFolderId(folderId)
    if (onFolderSelect) {
      onFolderSelect(folderId)
    }
  }

  if (loading) {
    return <LoadingSpinner className="mx-auto" />
  }

  return (
    <div className={className}>
      <h3 className="mb-4 text-lg font-semibold">Folders</h3>

      <div className="space-y-2">
        {folders.length === 0 ? (
          <div className="text-sm text-muted-foreground">No folders found</div>
        ) : (
          folders.map(folder => {
            const folderId = folder.uri.split('/').pop() || ''
            const isSelected = selectedFolderId === folderId
            
            return (
              <div
                key={folder.uri}
                className={`flex items-center justify-between rounded-md p-2 ${
                  isSelected ? 'bg-primary/10' : 'hover:bg-muted/50'
                }`}
              >
                <button
                  className="flex flex-1 items-center text-left"
                  onClick={() => handleFolderSelect(folderId)}
                >
                  <FolderIcon className="mr-2 h-4 w-4" />
                  <span>{folder.name}</span>
                </button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteFolder(folderId)}
                  className="h-7 w-7 shrink-0"
                >
                  <XCircleIcon className="h-4 w-4" />
                  <span className="sr-only">Delete</span>
                </Button>
              </div>
            )
          })
        )}
      </div>

      {allowCreate && (
        <div className="mt-4">
          <div className="flex items-center gap-2">
            <Input
              type="text"
              placeholder="New folder name"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              className="text-sm"
            />
            <Button
              variant="outline"
              size="sm"
              disabled={isCreating || !newFolderName.trim()}
              onClick={handleCreateFolder}
            >
              {isCreating ? (
                <LoadingSpinner className="h-4 w-4" />
              ) : (
                <PlusIcon className="h-4 w-4" />
              )}
              <span className="ml-1">Add</span>
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

// For backward compatibility with default exports
export default FolderBrowser
