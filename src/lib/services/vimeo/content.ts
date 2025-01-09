import type { VimeoVideo } from '@/types/vimeo'
import { vimeoClient } from './vimeo-client'

export async function getVimeoVideo(videoId: string): Promise<VimeoVideo> {
  try {
    const response = await vimeoClient.request<VimeoVideo>({
      method: 'GET',
      path: `/videos/${videoId}`,
    })

    if (!response || !response.data || !response.data[0]) {
      throw new Error('Invalid response from Vimeo API')
    }

    return response.data[0]
  } catch (error) {
    console.error('Error fetching Vimeo video:', error)
    throw error
  }
}

export async function updateVimeoVideo(
  videoId: string,
  updates: Partial<VimeoVideo>
): Promise<VimeoVideo> {
  try {
    const response = await vimeoClient.request<VimeoVideo>({
      method: 'PATCH',
      path: `/videos/${videoId}`,
      query: updates,
    })

    if (!response || !response.data || !response.data[0]) {
      throw new Error('Invalid response from Vimeo API')
    }

    return response.data[0]
  } catch (error) {
    console.error('Error updating Vimeo video:', error)
    throw error
  }
}

export async function deleteVimeoVideo(videoId: string): Promise<void> {
  try {
    await vimeoClient.request({
      method: 'DELETE',
      path: `/videos/${videoId}`,
    })
  } catch (error) {
    console.error('Error deleting Vimeo video:', error)
    throw error
  }
}
