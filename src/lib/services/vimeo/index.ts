import { handleApiError } from '@/lib/utils/error-handler'
import type {
  VimeoError,
  VimeoFolder,
  VimeoPrivacy,
  VimeoService,
  VimeoUploadOptions,
  VimeoUploadResponse,
  VimeoVideo,
} from '@/types/vimeo'
import * as tus from 'tus-js-client'

interface VimeoResponse<T> {
  data: T[]
  page: number
  per_page: number
  total: number
}

export class VimeoServiceImpl implements VimeoService {
  private apiKey: string
  private baseUrl = 'https://api.vimeo.com'

  constructor(apiKey: string) {
    this.apiKey = apiKey
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`
    const headers = {
      Authorization: `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
      Accept: 'application/vnd.vimeo.*+json;version=3.4',
      ...options.headers,
    }

    try {
      const response = await fetch(url, { ...options, headers })
      if (!response.ok) {
        throw this.handleError(await response.json())
      }
      const data = await response.json()
      return data as T
    } catch (error) {
      throw handleApiError(error as Error, {
        service: 'VimeoService',
        operation: 'makeRequest',
        details: { endpoint },
      })
    }
  }

  private handleError(error: unknown): VimeoError {
    const err = error as Record<string, unknown>
    return {
      name: 'VimeoError',
      code: (err.error as string) || 'UNKNOWN_ERROR',
      message:
        (err.error_description as string) ||
        (err.message as string) ||
        'An unknown error occurred',
      developer_message: (err.developer_message as string) || '',
      error_code: (err.error_code as number) || 500,
      status: (err.status as number) || 500,
      link: (err.link as string) || null,
    }
  }

  async getVideos(options?: {
    page?: number
    per_page?: number
  }): Promise<VimeoVideo[]> {
    try {
      const queryParams = new URLSearchParams()
      if (options?.page) queryParams.append('page', options.page.toString())
      if (options?.per_page)
        queryParams.append('per_page', options.per_page.toString())
      const response = await this.makeRequest<VimeoResponse<VimeoVideo>>(
        `/me/videos?${queryParams.toString()}`
      )
      return response.data
    } catch (error) {
      throw this.handleError(error)
    }
  }

  async getVideosByFolder(folderId: string): Promise<VimeoVideo[]> {
    try {
      const response = await this.makeRequest<VimeoResponse<VimeoVideo>>(
        `/me/folders/${folderId}/videos`
      )
      return response.data
    } catch (error) {
      throw this.handleError(error)
    }
  }

  async getAllVideos(): Promise<VimeoVideo[]> {
    try {
      const response =
        await this.makeRequest<VimeoResponse<VimeoVideo>>('/me/videos')
      return response.data
    } catch (error) {
      throw this.handleError(error)
    }
  }

  async getFolders(): Promise<VimeoFolder[]> {
    try {
      const response =
        await this.makeRequest<VimeoResponse<VimeoFolder>>('/me/folders')
      return response.data
    } catch (error) {
      throw this.handleError(error)
    }
  }

  async uploadVideo(
    file: File,
    metadata: VimeoUploadOptions
  ): Promise<VimeoVideo> {
    try {
      const uploadResponse = await this.makeRequest<VimeoUploadResponse>(
        '/me/videos',
        {
          method: 'POST',
          body: JSON.stringify({
            upload: { approach: 'tus', size: file.size },
            name: metadata.name,
            description: metadata.description,
            privacy: metadata.privacy,
          }),
        }
      )

      // Upload the file using TUS protocol
      const upload = new tus.Upload(file, {
        endpoint: uploadResponse.upload.upload_link,
        retryDelays: [0, 3000, 5000, 10000, 20000],
        metadata: {
          filename: file.name,
          filetype: file.type,
        },
        onError: error => {
          throw this.handleError(error)
        },
      })

      await new Promise<void>((resolve, reject) => {
        upload.start()
        upload.on('success', () => resolve())
        upload.on('error', reject)
      })

      const video = await this.makeRequest<VimeoVideo>(uploadResponse.uri)
      return video
    } catch (error) {
      throw this.handleError(error)
    }
  }

  async createFolder(name: string): Promise<VimeoFolder> {
    try {
      const response = await this.makeRequest<VimeoFolder>('/me/projects', {
        method: 'POST',
        body: JSON.stringify({ name }),
      })
      return response
    } catch (error) {
      throw this.handleError(error)
    }
  }

  async updateVideoMetadata(
    videoId: string,
    metadata: Partial<VimeoUploadOptions>
  ): Promise<VimeoVideo> {
    try {
      return await this.makeRequest<VimeoVideo>(`/videos/${videoId}`, {
        method: 'PATCH',
        body: JSON.stringify(metadata),
      })
    } catch (error) {
      throw handleApiError(error as Error, {
        service: 'VimeoService',
        operation: 'updateVideoMetadata',
        details: { videoId, metadata },
      })
    }
  }

  async updateVideoPrivacy(
    videoId: string,
    privacy: VimeoPrivacy
  ): Promise<VimeoVideo> {
    try {
      return await this.makeRequest<VimeoVideo>(`/videos/${videoId}`, {
        method: 'PATCH',
        body: JSON.stringify({ privacy }),
      })
    } catch (error) {
      throw handleApiError(error as Error, {
        service: 'VimeoService',
        operation: 'updateVideoPrivacy',
        details: { videoId, privacy },
      })
    }
  }

  async getVideoDetails(videoId: string): Promise<VimeoVideo> {
    try {
      const response = await this.makeRequest(`/videos/${videoId}`)
      return response as VimeoVideo
    } catch (error) {
      throw this.handleError(error)
    }
  }

  async uploadThumbnail(videoId: string, file: File): Promise<VimeoVideo> {
    try {
      const formData = new FormData()
      formData.append('file', file)
      const response = await this.makeRequest(`/videos/${videoId}/pictures`, {
        method: 'POST',
        body: formData,
      })
      return response as VimeoVideo
    } catch (error) {
      throw this.handleError(error)
    }
  }

  async generateThumbnail(videoId: string, time: number): Promise<VimeoVideo> {
    try {
      const response = await this.makeRequest(`/videos/${videoId}/pictures`, {
        method: 'POST',
        body: JSON.stringify({ time }),
      })
      return response as VimeoVideo
    } catch (error) {
      throw this.handleError(error)
    }
  }

  async deleteVideo(videoId: string): Promise<void> {
    try {
      await this.makeRequest(`/videos/${videoId}`, { method: 'DELETE' })
    } catch (error) {
      throw this.handleError(error)
    }
  }

  async updateVideo(
    videoId: string,
    updates: Partial<VimeoVideo>
  ): Promise<VimeoVideo> {
    try {
      const response = await this.makeRequest(`/videos/${videoId}`, {
        method: 'PATCH',
        body: JSON.stringify(updates),
      })
      return response as VimeoVideo
    } catch (error) {
      throw this.handleError(error)
    }
  }

  async createShowcase(
    name: string,
    description?: string
  ): Promise<VimeoFolder> {
    try {
      const response = await this.makeRequest('/me/albums', {
        method: 'POST',
        body: JSON.stringify({ name, description }),
      })
      return response as VimeoFolder
    } catch (error) {
      throw this.handleError(error)
    }
  }

  async addToShowcase(showcaseId: string, videoId: string): Promise<void> {
    try {
      await this.makeRequest(`/me/albums/${showcaseId}/videos/${videoId}`, {
        method: 'PUT',
      })
    } catch (error) {
      throw this.handleError(error)
    }
  }

  async getVideo(videoId: string): Promise<VimeoVideo> {
    return this.getVideoDetails(videoId)
  }
}

// Export the service implementation
export const vimeoService = new VimeoServiceImpl(process.env.NEXT_PUBLIC_VIMEO_ACCESS_TOKEN || '')

// Export individual functions
export const {
  getVideoDetails,
  updateVideoPrivacy,
  getVideosByFolder: getVideosFromFolder,
  getAllVideos,
  getFolders,
  uploadVideo,
  createFolder,
  updateVideoMetadata,
  uploadThumbnail,
  generateThumbnail,
  deleteVideo
} = vimeoService

// Re-export types
export type {
  VimeoError,
  VimeoFolder,
  VimeoPrivacy,
  VimeoService,
  VimeoUploadOptions,
  VimeoVideo
}

