import { Vimeo } from '@vimeo/vimeo'

const client = new Vimeo(
  import.meta.env.VITE_VIMEO_CLIENT_ID!,
  import.meta.env.VITE_VIMEO_CLIENT_SECRET!,
  import.meta.env.VITE_VIMEO_ACCESS_TOKEN!
)

export async function getVideosFromFolder(folderId: string) {
  return new Promise((resolve, reject) => {
    client.request(
      {
        method: 'GET',
        path: `/me/folders/${folderId}/videos`,
        query: {
          fields: 'uri,name,description,pictures,privacy',
        },
      },
      (error, result) => {
        if (error) {
          reject(error)
        } else {
          resolve(result.data)
        }
      }
    )
  })
}

export async function updateVideoPrivacy(videoId: string, makePublic: boolean) {
  return new Promise((resolve, reject) => {
    client.request(
      {
        method: 'PATCH',
        path: `/videos/${videoId}`,
        query: {
          privacy: {
            view: makePublic ? 'anybody' : 'disable',
            embed: makePublic ? 'public' : 'private',
          },
        },
      },
      (error, result) => {
        if (error) {
          reject(error)
        } else {
          resolve(result)
        }
      }
    )
  })
}

export const vimeoService = {
  getVideoDetails: async (videoId: string) => {
    return new Promise((resolve, reject) => {
      client.request(
        {
          method: 'GET',
          path: `/videos/${videoId}`,
        },
        (error, result) => {
          if (error) {
            reject(error)
          } else {
            resolve(result)
          }
        }
      )
    })
  },

  getVideos: async () => {
    return new Promise((resolve, reject) => {
      client.request(
        {
          method: 'GET',
          path: '/me/videos',
        },
        (error, result) => {
          if (error) {
            reject(error)
          } else {
            resolve(result)
          }
        }
      )
    })
  },

  uploadVideo: async (file: File, name: string, description: string) => {
    return new Promise((resolve, reject) => {
      client.upload(
        file,
        {
          name,
          description,
        },
        uri => {
          resolve(uri)
        },
        error => {
          reject(error)
        },
        () => {
          // Progress callback
        }
      )
    })
  },

  updateVideoMetadata: async (
    videoId: string,
    metadata: { name?: string; description?: string }
  ) => {
    return new Promise((resolve, reject) => {
      client.request(
        {
          method: 'PATCH',
          path: `/videos/${videoId}`,
          query: metadata,
        },
        (error, result) => {
          if (error) {
            reject(error)
          } else {
            resolve(result)
          }
        }
      )
    })
  },

  deleteVideo: async (videoId: string) => {
    return new Promise((resolve, reject) => {
      client.request(
        {
          method: 'DELETE',
          path: `/videos/${videoId}`,
        },
        error => {
          if (error) {
            reject(error)
          } else {
            resolve(true)
          }
        }
      )
    })
  },

  getVideosFromFolder,
  updateVideoPrivacy,
}
