import { createAPIError } from '@/lib/error'
import type { ContentSecurity, VimeoRequestOptions, VimeoUploadOptions, VimeoVideo } from '@/types/vimeo'

export class VimeoService {
  private accessToken: string
  private baseUrl = 'https://api.vimeo.com'

  constructor(accessToken: string) {
    this.accessToken = accessToken
  }
  async getVideo(videoId: string): Promise<VimeoVideo> {
    try {
      return await this.request<VimeoVideo>({
        method: 'GET',
        path: `/videos/${videoId}`
      })
    } catch (error) {
      throw this.handleError(error)
    }
  }

  async getVideoStatus(videoId: string): Promise<{
    status: 'uploading' | 'transcoding' | 'available' | 'error'
    progress: number
  }> {
    try {
      const video = await this.getVideo(videoId)

      if (video.transcode.status === 'complete') {
        return { status: 'available', progress: 100 }
      }

      if (video.transcode.status === 'in_progress') {
        return {
          status: 'transcoding',
          progress: video.transcode.progress ? Number(video.transcode.progress) : 0
        }
      }

      if (video.transcode.status === 'error') {
        return { status: 'error', progress: 0 }
      }

      return { status: 'uploading', progress: 0 }
    } catch (error) {
      throw this.handleError(error)
    }
  }

  private async request<T>(options: VimeoRequestOptions): Promise<T> {
    const response = await fetch(`${this.baseUrl}${options.path}`, {
      method: options.method,
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
        'Accept': 'application/vnd.vimeo.*+json;version=3.4',
        ...options.headers
      },
      body: options.body ? JSON.stringify(options.body) : undefined
    })

    if (!response.ok) {
      throw this.handleError(await response.json())
    }

    return response.json()
  }

  private handleError(error: any): Error {
    if (error.error) {
      return createAPIError(
        error.error.code || 500,
        error.error.message || 'An error occurred',
        error.error.name || 'VIMEO_API_ERROR',
        error
      )
    }
    return createAPIError(500, 'An unexpected error occurred', 'VIMEO_API_ERROR', error)
  }

  async uploadVideo(file: File, options: VimeoUploadOptions, onProgress?: (progress: { loaded: number; total: number; percent: number }) => void) {
    try {
      const uploadResponse = await this.request<{ upload: { upload_link: string } }>({
        method: 'POST',
        path: '/me/videos',
        body: {
          name: options.name,
          description: options.description,
          folder_uri: options.folderUri,
          privacy: {
            view: options.privacy?.view || 'disable',
            embed: options.privacy?.embed || 'private',
            comments: options.privacy?.comments || 'nobody',
            download: options.privacy?.download || false
          }
        }
      })

      const uploadUrl = uploadResponse.upload.upload_link
      const xhr = new XMLHttpRequest()

      xhr.upload.addEventListener('progress', (event) => {
        if (onProgress && event.lengthComputable) {
          onProgress({
            loaded: event.loaded,
            total: event.total,
            percent: (event.loaded / event.total) * 100
          })
        }
      })

      return new Promise<string>((resolve, reject) => {
        xhr.addEventListener('load', () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve(uploadUrl)
          } else {
            reject(new Error(`Upload failed with status ${xhr.status}`))
          }
        })

        xhr.addEventListener('error', () => reject(new Error('Upload failed')))
        xhr.open('PUT', uploadUrl)
        xhr.send(file)
      })
    } catch (error) {
      throw this.handleError(error)
    }
  }

  async getVideos(): Promise<VimeoVideo[]> {
    try {
      const response = await this.request<{ data: VimeoVideo[] }>({
        method: 'GET',
        path: '/me/videos'
      })
      return response.data
    } catch (error) {
      throw this.handleError(error)
    }
  }

  async deleteVideo(videoId: string): Promise<void> {
    try {
      await this.request({
        method: 'DELETE',
        path: `/videos/${videoId}`
      })
    } catch (error) {
      throw this.handleError(error)
    }
  }

  async updateVideoPrivacy(videoId: string, privacy: ContentSecurity['privacy']): Promise<void> {
    try {
      await this.request({
        method: 'PATCH',
        path: `/videos/${videoId}`,
        body: { privacy }
      })
    } catch (error) {
      throw this.handleError(error)
    }
  }

  async updateVideoMetadata(videoId: string, metadata: {
    name?: string
    description?: string
    privacy?: ContentSecurity['privacy']
    pictures?: {
      active: boolean
      uri?: string
    }
  }): Promise<void> {
    try {
      await this.request({
        method: 'PATCH',
        path: `/videos/${videoId}`,
        body: metadata
      })
    } catch (error) {
      throw this.handleError(error)
    }
  }

  async createFolder(name: string): Promise<string> {
    try {
      const response = await this.request<{ uri: string }>({
        method: 'POST',
        path: '/me/projects',
        body: { name }
      })
      return response.uri
    } catch (error) {
      throw this.handleError(error)
    }
  }
}

export const vimeoService = new VimeoService(
  process.env.VITE_VIMEO_ACCESS_TOKEN!
);
