import type { VimeoFolder, VimeoVideo } from '@/types/vimeo'

class VimeoService {
  private readonly API_URL = 'https://api.vimeo.com'
  private readonly ACCESS_TOKEN = process.env.VITE_VIMEO_ACCESS_TOKEN

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const response = await fetch(`${this.API_URL}${endpoint}`, {
      ...options,
      headers: {
        Authorization: `Bearer ${this.ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    })

    if (!response.ok) {
      throw new Error(`Vimeo API error: ${response.statusText}`)
    }

    return response.json()
  }

  async getVideos(): Promise<VimeoVideo[]> {
    return this.request<VimeoVideo[]>('/me/videos')
  }

  async getVideo(videoId: string): Promise<VimeoVideo> {
    return this.request<VimeoVideo>(`/videos/${videoId}`)
  }

  async deleteVideo(videoId: string): Promise<void> {
    await this.request(`/videos/${videoId}`, { method: 'DELETE' })
  }

  async updateVideoSecurity(
    videoId: string,
    updates: Partial<VimeoVideo['privacy']>
  ): Promise<VimeoVideo> {
    return this.request<VimeoVideo>(`/videos/${videoId}`, {
      method: 'PATCH',
      body: JSON.stringify({ privacy: updates }),
    })
  }

  async getFolders(): Promise<VimeoFolder[]> {
    return this.request<VimeoFolder[]>('/me/folders')
  }

  async getFolder(folderId: string): Promise<VimeoFolder> {
    return this.request<VimeoFolder>(`/folders/${folderId}`)
  }

  async getFolderVideos(folderId: string): Promise<VimeoVideo[]> {
    return this.request<VimeoVideo[]>(`/folders/${folderId}/videos`)
  }

  async getVideoDetails(videoId: string): Promise<VimeoVideo> {
    return this.request<VimeoVideo>(`/videos/${videoId}`)
  }

  async uploadVideo(
    file: File,
    metadata: Partial<VimeoVideo>
  ): Promise<VimeoVideo> {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('metadata', JSON.stringify(metadata))

    return this.request<VimeoVideo>('/me/videos', {
      method: 'POST',
      body: formData,
      headers: {
        Authorization: `Bearer ${this.ACCESS_TOKEN}`,
      },
    })
  }

  async uploadThumbnail(videoId: string, file: File): Promise<VimeoVideo> {
    const formData = new FormData()
    formData.append('file', file)

    return this.request<VimeoVideo>(`/videos/${videoId}/pictures`, {
      method: 'POST',
      body: formData,
      headers: {
        Authorization: `Bearer ${this.ACCESS_TOKEN}`,
      },
    })
  }

  async generateThumbnail(videoId: string, time: number): Promise<VimeoVideo> {
    return this.request<VimeoVideo>(`/videos/${videoId}/pictures`, {
      method: 'POST',
      body: JSON.stringify({ time }),
    })
  }

  async updateVideoMetadata(
    videoId: string,
    metadata: Partial<VimeoVideo>
  ): Promise<VimeoVideo> {
    return this.request<VimeoVideo>(`/videos/${videoId}`, {
      method: 'PATCH',
      body: JSON.stringify(metadata),
    })
  }

  async getVideosByFolder(folderId: string): Promise<VimeoVideo[]> {
    return this.getFolderVideos(folderId)
  }

  async getAllVideos(): Promise<VimeoVideo[]> {
    return this.getVideos()
  }

  async updateVideoPrivacy(
    videoId: string,
    privacy: Partial<VimeoVideo['privacy']>
  ): Promise<VimeoVideo> {
    return this.updateVideoSecurity(videoId, privacy)
  }
}

export const vimeoService = new VimeoService()

// Export individual functions
export const {
  getVideoDetails,
  updateVideoPrivacy,
  getVideosByFolder,
  getAllVideos,
  uploadVideo,
  uploadThumbnail,
  generateThumbnail,
  updateVideoMetadata
} = vimeoService
