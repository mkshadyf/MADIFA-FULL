import type { StreamConfig, StreamManifest } from '@/types/streaming'

export async function initializeStream(
  contentId: string,
  config: StreamConfig
): Promise<StreamManifest> {
  try {
    const response = await fetch(`/api/stream/${contentId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(config),
    })

    if (!response.ok) {
      throw new Error('Failed to initialize stream')
    }

    return response.json()
  } catch (error) {
    console.error('Stream initialization error:', error)
    throw new Error('Failed to initialize stream')
  }
}

export async function trackProgress(
  contentId: string,
  progress: number,
  duration: number
): Promise<void> {
  try {
    await fetch(`/api/progress/${contentId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        progress: progress.toString(),
        duration: duration.toString(),
      }),
    })
  } catch (error) {
    console.error('Progress tracking error:', error)
  }
} 