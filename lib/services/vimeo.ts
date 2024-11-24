import type { VideoQuality, VimeoVideo } from '@/types/vimeo'
import { Vimeo } from '@vimeo/vimeo'
import { getSubscriptionStatus } from './subscription'

const vimeoClient = new Vimeo(
  process.env.NEXT_PUBLIC_VIMEO_CLIENT_ID!,
  process.env.NEXT_PUBLIC_VIMEO_CLIENT_SECRET!,
  process.env.NEXT_PUBLIC_VIMEO_ACCESS_TOKEN!
)

export async function getVideoDetails(videoId: string): Promise<VimeoVideo> {
  return new Promise((resolve, reject) => {
    vimeoClient.request({
      method: 'GET',
      path: `/videos/${videoId}`,
      query: {
        fields: 'uri,name,description,duration,pictures,files,privacy,status'
      }
    }, (error, result) => {
      if (error) reject(error)
      else resolve(result as VimeoVideo)
    })
  })
}

export async function uploadVideo(
  file: File,
  options: {
    name: string
    description?: string
    privacy?: 'anybody' | 'disable' | 'unlisted'
  }
): Promise<string> {
  return new Promise((resolve, reject) => {
    vimeoClient.upload(
      file,
      {
        name: options.name,
        description: options.description,
        privacy: { view: options.privacy || 'disable' }
      },
      (uri) => resolve(uri.split('/').pop()!),
      (error) => reject(error),
      (bytesUploaded, bytesTotal) => {
        const progress = Math.round((bytesUploaded / bytesTotal) * 100)
        console.log(`Upload progress: ${progress}%`)
      }
    )
  })
}

export async function getPlaybackUrl(
  videoId: string,
  quality: VideoQuality = '720p',
  userId?: string
): Promise<string> {
  if (userId) {
    const subscription = await getSubscriptionStatus(userId)
    if (subscription?.status !== 'active') {
      throw new Error('Active subscription required')
    }
  }

  const video = await getVideoDetails(videoId)
  const file = video.files.find(f => f.quality === quality) || video.files[0]
  return file.link
}

export async function updateVideoPrivacy(videoId: string, makePublic: boolean): Promise<void> {
  return new Promise((resolve, reject) => {
    vimeoClient.request({
      method: 'PATCH',
      path: `/videos/${videoId}`,
      query: {
        privacy: {
          view: makePublic ? 'anybody' : 'disable'
        }
      }
    }, (error) => {
      if (error) reject(error)
      else resolve()
    })
  })
}

export async function getVideosFromFolder(folderId: string): Promise<VimeoVideo[]> {
  return new Promise((resolve, reject) => {
    vimeoClient.request({
      method: 'GET',
      path: `/me/folders/${folderId}/videos`,
      query: {
        fields: 'uri,name,description,duration,pictures,files,privacy,status'
      }
    }, (error: Error | null, result: any) => {
      if (error) {
        reject(error)
        return
      }
      resolve(result.data)
    })
  })
}

export async function updateVideosPrivacy(
  videoIds: string[],
  makePublic: boolean
): Promise<void> {
  await Promise.all(
    videoIds.map(id => updateVideoPrivacy(id, makePublic))
  )
} 