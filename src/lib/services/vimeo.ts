import { env } from '@/config/env'
import { handleVimeoError } from '@/lib/utils/error-handler'
import type { VimeoVideo } from '@/types/vimeo'

const VIMEO_API_URL = 'https://api.vimeo.com'

const headers = {
  Authorization: `Bearer ${env.VITE_VIMEO_ACCESS_TOKEN}`,
  'Content-Type': 'application/json',
  Accept: 'application/vnd.vimeo.*+json;version=3.4',
}

export async function getVideos(page = 1, perPage = 25): Promise<VimeoVideo[]> {
  try {
    const response = await fetch(
      `${VIMEO_API_URL}/me/videos?page=${page}&per_page=${perPage}`,
      { headers }
    )

    if (!response.ok) {
      throw new Error(`Failed to fetch videos: ${response.statusText}`)
    }

    const data = await response.json()
    return data.data
  } catch (error) {
    throw handleVimeoError(error as Error)
  }
}

export async function getVideoDetails(videoId: string): Promise<VimeoVideo> {
  try {
    const response = await fetch(`${VIMEO_API_URL}/videos/${videoId}`, { headers })

    if (!response.ok) {
      throw new Error(`Failed to fetch video details: ${response.statusText}`)
    }

    return response.json()
  } catch (error) {
    throw handleVimeoError(error as Error)
  }
}

export async function uploadVideo(file: File, name: string): Promise<VimeoVideo> {
  try {
    // Step 1: Create upload
    const createResponse = await fetch(`${VIMEO_API_URL}/me/videos`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        upload: {
          approach: 'tus',
          size: file.size,
        },
        name,
      }),
    })

    if (!createResponse.ok) {
      throw new Error(`Failed to create upload: ${createResponse.statusText}`)
    }

    const { upload, uri } = await createResponse.json()

    // Step 2: Upload file using TUS
    const uploadResponse = await fetch(upload.upload_link, {
      method: 'PATCH',
      headers: {
        'Tus-Resumable': '1.0.0',
        'Upload-Offset': '0',
        'Content-Type': 'application/offset+octet-stream',
      },
      body: file,
    })

    if (!uploadResponse.ok) {
      throw new Error(`Failed to upload file: ${uploadResponse.statusText}`)
    }

    // Step 3: Get video details
    const videoId = uri.split('/').pop()
    return getVideoDetails(videoId)
  } catch (error) {
    throw handleVimeoError(error as Error)
  }
}

export async function updateVideoPrivacy(
  videoId: string,
  privacy: {
    view?: 'anybody' | 'nobody' | 'password' | 'disable'
    embed?: 'public' | 'private' | 'whitelist'
    download?: boolean
    add?: boolean
    comments?: 'anybody' | 'nobody'
  }
): Promise<VimeoVideo> {
  try {
    const response = await fetch(`${VIMEO_API_URL}/videos/${videoId}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ privacy }),
    })

    if (!response.ok) {
      throw new Error(`Failed to update video privacy: ${response.statusText}`)
    }

    return response.json()
  } catch (error) {
    throw handleVimeoError(error as Error)
  }
}

export async function deleteVideo(videoId: string): Promise<void> {
  try {
    const response = await fetch(`${VIMEO_API_URL}/videos/${videoId}`, {
      method: 'DELETE',
      headers,
    })

    if (!response.ok) {
      throw new Error(`Failed to delete video: ${response.statusText}`)
    }
  } catch (error) {
    throw handleVimeoError(error as Error)
  }
}

export async function updateVideoMetadata(
  videoId: string,
  data: {
    name?: string
    description?: string
    privacy?: {
      view?: 'anybody' | 'nobody' | 'password' | 'disable'
      embed?: 'public' | 'private' | 'whitelist'
      download?: boolean
      add?: boolean
      comments?: 'anybody' | 'nobody'
    }
  }
): Promise<VimeoVideo> {
  try {
    const response = await fetch(`${VIMEO_API_URL}/videos/${videoId}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      throw new Error(`Failed to update video metadata: ${response.statusText}`)
    }

    return response.json()
  } catch (error) {
    throw handleVimeoError(error as Error)
  }
}

export async function getVideoThumbnails(videoId: string): Promise<string[]> {
  try {
    const response = await fetch(`${VIMEO_API_URL}/videos/${videoId}/pictures`, {
      headers,
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch video thumbnails: ${response.statusText}`)
    }

    const data = await response.json()
    return data.data.map((picture: any) => picture.link)
  } catch (error) {
    throw handleVimeoError(error as Error)
  }
}

export async function generateVideoThumbnail(
  videoId: string,
  time: number
): Promise<string> {
  try {
    const response = await fetch(`${VIMEO_API_URL}/videos/${videoId}/pictures`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        time,
        active: true,
      }),
    })

    if (!response.ok) {
      throw new Error(`Failed to generate video thumbnail: ${response.statusText}`)
    }

    const data = await response.json()
    return data.link
  } catch (error) {
    throw handleVimeoError(error as Error)
  }
}

export async function getVideoChapters(videoId: string): Promise<any[]> {
  try {
    const response = await fetch(`${VIMEO_API_URL}/videos/${videoId}/chapters`, {
      headers,
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch video chapters: ${response.statusText}`)
    }

    const data = await response.json()
    return data.data
  } catch (error) {
    throw handleVimeoError(error as Error)
  }
}

export async function addVideoChapter(
  videoId: string,
  chapter: {
    title: string
    timecode: number
  }
): Promise<any> {
  try {
    const response = await fetch(`${VIMEO_API_URL}/videos/${videoId}/chapters`, {
      method: 'POST',
      headers,
      body: JSON.stringify(chapter),
    })

    if (!response.ok) {
      throw new Error(`Failed to add video chapter: ${response.statusText}`)
    }

    return response.json()
  } catch (error) {
    throw handleVimeoError(error as Error)
  }
}

export async function updateVideoChapter(
  videoId: string,
  chapterId: string,
  chapter: {
    title?: string
    timecode?: number
  }
): Promise<any> {
  try {
    const response = await fetch(
      `${VIMEO_API_URL}/videos/${videoId}/chapters/${chapterId}`,
      {
        method: 'PATCH',
        headers,
        body: JSON.stringify(chapter),
      }
    )

    if (!response.ok) {
      throw new Error(`Failed to update video chapter: ${response.statusText}`)
    }

    return response.json()
  } catch (error) {
    throw handleVimeoError(error as Error)
  }
}

export async function deleteVideoChapter(
  videoId: string,
  chapterId: string
): Promise<void> {
  try {
    const response = await fetch(
      `${VIMEO_API_URL}/videos/${videoId}/chapters/${chapterId}`,
      {
        method: 'DELETE',
        headers,
      }
    )

    if (!response.ok) {
      throw new Error(`Failed to delete video chapter: ${response.statusText}`)
    }
  } catch (error) {
    throw handleVimeoError(error as Error)
  }
}

export async function getVideoStats(videoId: string): Promise<any> {
  try {
    const response = await fetch(`${VIMEO_API_URL}/videos/${videoId}/stats`, {
      headers,
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch video stats: ${response.statusText}`)
    }

    return response.json()
  } catch (error) {
    throw handleVimeoError(error as Error)
  }
}

export async function getVideoProgress(videoId: string): Promise<any> {
  try {
    const response = await fetch(
      `${VIMEO_API_URL}/me/videos/${videoId}/progress`,
      {
        headers,
      }
    )

    if (!response.ok) {
      throw new Error(`Failed to fetch video progress: ${response.statusText}`)
    }

    return response.json()
  } catch (error) {
    throw handleVimeoError(error as Error)
  }
}

export async function updateVideoProgress(
  videoId: string,
  seconds: number
): Promise<void> {
  try {
    const response = await fetch(
      `${VIMEO_API_URL}/me/videos/${videoId}/progress`,
      {
        method: 'PUT',
        headers,
        body: JSON.stringify({
          seconds,
        }),
      }
    )

    if (!response.ok) {
      throw new Error(`Failed to update video progress: ${response.statusText}`)
    }
  } catch (error) {
    throw handleVimeoError(error as Error)
  }
}
