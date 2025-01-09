import type { VimeoStats, VimeoVideo } from '@/types/vimeo'
import { Vimeo } from '@vimeo/vimeo'

interface VimeoRequestOptions {
  method: string
  path: string
  query?: Record<string, unknown>
}

interface VimeoResponse<T = unknown> {
  data: T[]
  page: number
  per_page: number
  total: number
}

interface VideoWithStats extends Omit<VimeoVideo, 'stats'> {
  stats: Partial<VimeoStats>
}

class VimeoClientService {
  private static instance: VimeoClientService
  private client: Vimeo

  private constructor() {
    if (
      !process.env.NEXT_PUBLIC_VIMEO_CLIENT_ID ||
      !process.env.NEXT_PUBLIC_VIMEO_CLIENT_SECRET ||
      !process.env.NEXT_PUBLIC_VIMEO_ACCESS_TOKEN
    ) {
      throw new Error('Missing Vimeo credentials')
    }

    this.client = new Vimeo(
      process.env.NEXT_PUBLIC_VIMEO_CLIENT_ID,
      process.env.NEXT_PUBLIC_VIMEO_CLIENT_SECRET,
      process.env.NEXT_PUBLIC_VIMEO_ACCESS_TOKEN
    )
  }

  public static getInstance(): VimeoClientService {
    if (!VimeoClientService.instance) {
      VimeoClientService.instance = new VimeoClientService()
    }
    return VimeoClientService.instance
  }

  public async request<T>(
    options: VimeoRequestOptions
  ): Promise<VimeoResponse<T>> {
    return new Promise((resolve, reject) => {
      this.client.request(
        {
          method: options.method,
          path: options.path,
          query: options.query,
        },
        (error: Error | null, result: VimeoResponse<T>) => {
          if (error) reject(error)
          else resolve(result)
        }
      )
    })
  }

  public async getVideoStats(): Promise<{
    totalViews: number
    totalFinishes: number
    averageProgress: number
    totalWatchTime: number
  }> {
    const response = await this.request<VideoWithStats>({
      method: 'GET',
      path: '/me/videos',
      query: {
        fields: 'stats',
        per_page: 100,
      },
    })

    const stats = response.data.reduce(
      (acc, video) => {
        acc.totalViews += video.stats.plays || 0
        acc.totalFinishes += video.stats.finishes || 0
        acc.totalWatchTime += video.stats.loads || 0 // Using loads as a proxy for watch time
        return acc
      },
      {
        totalViews: 0,
        totalFinishes: 0,
        averageProgress: 0,
        totalWatchTime: 0,
      }
    )

    stats.averageProgress =
      response.data.length > 0
        ? (stats.totalFinishes / stats.totalViews) * 100
        : 0

    return stats
  }
}

export const vimeoClient = VimeoClientService.getInstance()
