import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import type { VimeoError } from '@/types/vimeo'
import { vimeoService } from '@/lib/services/vimeo'

import { useToast } from './useToast'

export function useVimeoContent(videoId?: string) {
  const { showToast } = useToast()
  const queryClient = useQueryClient()

  const videoQuery = useQuery({
    queryKey: ['vimeo', videoId] as const,
    queryFn: () => vimeoService.getVideo(videoId!),
    enabled: !!videoId,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  })

  const uploadMutation = useMutation<
    string,
    VimeoError,
    {
      file: File
      metadata: { name: string; description: string; folder_uri?: string }
    }
  >({
    mutationFn: data => vimeoService.uploadVideo(data.file, data.metadata),
    onSuccess: () => {
      showToast('Video uploaded successfully', 'success')
      queryClient.invalidateQueries({ queryKey: ['vimeo'] })
    },
    onError: (error: VimeoError) => {
      showToast(error.message || 'Failed to upload video', 'error')
    },
  })

  const deleteMutation = useMutation<void, VimeoError, string>({
    mutationFn: vimeoService.deleteVideo,
    onSuccess: () => {
      showToast('Video deleted successfully', 'success')
      queryClient.invalidateQueries({ queryKey: ['vimeo'] })
    },
    onError: (error: VimeoError) => {
      showToast(error.message || 'Failed to delete video', 'error')
    },
  })

  const folderMutation = useMutation<string, VimeoError, string>({
    mutationFn: vimeoService.createFolder,
    onSuccess: () => {
      showToast('Folder created successfully', 'success')
      queryClient.invalidateQueries({ queryKey: ['vimeo', 'folders'] })
    },
    onError: (error: VimeoError) => {
      showToast(error.message || 'Failed to create folder', 'error')
    },
  })

  return {
    video: videoQuery.data,
    isLoading: videoQuery.isLoading,
    error: videoQuery.error,
    uploadVideo: uploadMutation.mutateAsync,
    deleteVideo: deleteMutation.mutateAsync,
    createFolder: folderMutation.mutateAsync,
    isUploading: uploadMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isCreatingFolder: folderMutation.isPending,
  }
}
