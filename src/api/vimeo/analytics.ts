import { Vimeo } from '@vimeo/vimeo'

interface VimeoVideo {
  uri: string
  name: string
  stats: {
    plays: number
    finishes: number
    impressions: number
    time_watched: number
  }
}

interface VimeoResponse {
  data: unknown[]
  status: number
}

export async function GET(): Promise<Response> {
  try {
    const clientId = process.env['VITE_VIMEO_CLIENT_ID']
    const clientSecret = process.env['VITE_VIMEO_CLIENT_SECRET']
    const accessToken = process.env['VITE_VIMEO_ACCESS_TOKEN']

    if (!clientId || !clientSecret || !accessToken) {
      throw new Error('Missing Vimeo credentials')
    }

    const vimeoClient = new Vimeo(clientId, clientSecret, accessToken)

    const response = await new Promise<VimeoResponse>((resolve, reject) => {
      vimeoClient.request(
        {
          method: 'GET',
          path: '/me/videos',
          query: {
            fields: 'uri,name,stats',
            per_page: 100,
            sort: 'date',
            direction: 'desc',
          },
        },
        (error, result) => {
          if (error) reject(error)
          else resolve(result as VimeoResponse)
        }
      )
    })

    const videos = response.data as VimeoVideo[]

    return new Response(JSON.stringify(videos), {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=300',
      },
    })
  } catch (error) {
    console.error('Error fetching Vimeo analytics:', error)
    const errorMessage =
      error instanceof Error ? error.message : 'Failed to fetch analytics'

    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    })
  }
}
