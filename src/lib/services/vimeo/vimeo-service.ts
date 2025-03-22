/// <reference lib="dom" />

import type { 
  VimeoFolder, 
  VimeoPrivacy, 
  VimeoVideo, 
  VimeoStats, 
  FetchOptions, 
  VimeoResponse, 
  VimeoRequestOptions, 
  VideoWithStats, 
  ExtendedVimeoUploadOptions,
  VimeoUploadResponse
} from './types'
import * as tus from 'tus-js-client'

/**
 * Consolidated Vimeo Service that handles all Vimeo API interactions
 */
export class VimeoService {
  private static instance: VimeoService
  private apiKey: string
  private baseUrl = 'https://api.vimeo.com'
  
  private constructor() {
    if (
      !process.env.NEXT_PUBLIC_VIMEO_CLIENT_ID ||
      !process.env.NEXT_PUBLIC_VIMEO_CLIENT_SECRET ||
      !process.env.NEXT_PUBLIC_VIMEO_ACCESS_TOKEN
    ) {
      throw new Error('Missing Vimeo credentials')
    }
    
    this.apiKey = process.env.NEXT_PUBLIC_VIMEO_ACCESS_TOKEN
  }

  /**
   * Get the singleton instance
   */
  public static getInstance(): VimeoService {
    if (!VimeoService.instance) {
      VimeoService.instance = new VimeoService()
    }
    return VimeoService.instance
  }
  
  /**
   * Make a request to the Vimeo API
   */
  private async makeRequest<T>(
    endpoint: string,
    options: FetchOptions = {}
  ): Promise<T> {
    // Create headers object
    const headers = {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
      'Accept': 'application/vnd.vimeo.*+json;version=3.4'
    }
    
    // Merge with any existing headers
    const mergedHeaders = { 
      ...headers,
      ...(options.headers as Record<string, string> || {})
    }
    
    // Create request options
    const requestOptions: FetchOptions = {
      ...options,
      headers: mergedHeaders
    }

    // Make request
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: requestOptions.method,
      headers: requestOptions.headers,
      body: requestOptions.body,
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || errorData.message || 'Unknown Vimeo API Error')
    }

    return response.json()
  }

  /**
   * Client API-compatible request method
   * Used by the vimeo-client to maintain compatibility with admin components
   */
  public async clientRequest<T extends Record<string, unknown>>(options: VimeoRequestOptions): Promise<VimeoResponse<T>> {
    const { method, path, query, body } = options
    
    // Construct the query string
    const queryParams = new URLSearchParams()
    if (query) {
      Object.entries(query).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, String(value))
        }
      })
    }
    
    // Build the URL with query string
    const queryString = queryParams.toString()
    const url = queryString ? `${path}?${queryString}` : path
    
    // Create fetch options
    const fetchOptions: FetchOptions = {
      method,
      headers: {
        'Content-Type': 'application/json'
      }
    }
    
    // Add body if present
    if (body && Object.keys(body).length > 0) {
      fetchOptions.body = JSON.stringify(body)
    }
    
    return this.makeRequest<VimeoResponse<T>>(url, fetchOptions)
  }

  /**
   * General request wrapper for Vimeo API
   */
  public async request<T = unknown>(options: VimeoRequestOptions): Promise<VimeoResponse<T>> {
    try {
      const { method, path, query, body } = options
      
      // Build the URL with query parameters
      let url = path
      if (query && Object.keys(query).length > 0) {
        const params = new URLSearchParams()
        Object.entries(query).forEach(([key, value]) => {
          if (value !== undefined) {
            params.append(key, String(value))
          }
        })
        url = `${path}?${params.toString()}`
      }
      
      // Make the request
      const response = await this.makeRequest<VimeoResponse<T>>(url, { 
        method, 
        body: body ? JSON.stringify(body) : undefined 
      })
      return response
    } catch (error) {
      console.error('Error making Vimeo API request:', error)
      throw error
    }
  }
  
  // ==================== Video Management ====================
  
  /**
   * Get video details
   */
  public async getVideo(videoId: string): Promise<VimeoVideo> {
    try {
      const response = await this.request<VimeoVideo>({
        method: 'GET',
        path: `/videos/${videoId}`,
      })

      // Handle both single item and array responses
      if (Array.isArray(response.data) && response.data.length > 0) {
        return response.data[0]
      } else if (response.data) {
        return response.data as unknown as VimeoVideo
      }
      
      throw new Error('Invalid response from Vimeo API')
    } catch (error) {
      console.error('Error getting video details:', error)
      throw error
    }
  }
  
  /**
   * Update a video
   */
  public async updateVideo(
    videoId: string,
    updates: Partial<VimeoVideo>
  ): Promise<VimeoVideo> {
    try {
      const response = await this.request<VimeoVideo>({
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
  
  /**
   * Update video properties including privacy settings
   */
  public async updateVideoProperties(videoId: string, updates: { privacy?: Partial<VimeoPrivacy>; name?: string; description?: string }): Promise<boolean> {
    try {
      await this.request({
        method: 'PATCH',
        path: `/videos/${videoId}`,
        body: updates
      });
      
      return true;
    } catch (error) {
      console.error('Error updating video:', error);
      throw error;
    }
  }
  
  /**
   * Delete a video
   */
  public async deleteVideo(videoId: string): Promise<void> {
    try {
      await this.request({
        method: 'DELETE',
        path: `/videos/${videoId}`,
      })
    } catch (error) {
      console.error('Error deleting Vimeo video:', error)
      throw error
    }
  }
  
  /**
   * Get videos for a user or project
   */
  public async getVideos(
    options: {
      page?: number
      perPage?: number
      query?: string
      sort?: string
      direction?: 'asc' | 'desc'
      folderId?: string
    } = {}
  ): Promise<{ videos: VimeoVideo[]; total: number }> {
    try {
      const { page = 1, perPage = 10, query, sort, direction, folderId } = options
      
      const path = folderId ? `/folders/${folderId}/videos` : '/me/videos'
      
      const response = await this.request<VimeoVideo>({
        method: 'GET',
        path,
        query: {
          page,
          per_page: perPage,
          query,
          sort,
          direction,
        },
      })

      return {
        videos: response.data,
        total: response.total,
      }
    } catch (error) {
      console.error('Error fetching videos:', error)
      throw error
    }
  }
  
  /**
   * Get videos from a specific folder
   */
  public async getVideosByFolder(folderId: string): Promise<VimeoVideo[]> {
    try {
      const response = await this.request<VimeoVideo>({
        method: 'GET',
        path: `/me/folders/${folderId}/videos`,
        query: {
          per_page: 100,
        },
      })

      // Return videos from the response
      if (Array.isArray(response.data)) {
        return response.data
      }
      
      return []
    } catch (error) {
      console.error('Error getting videos by folder:', error)
      return []
    }
  }

  // ==================== Analytics ====================
  
  /**
   * Get video analytics
   */
  public async getVideoStats(videoId: string): Promise<Partial<VimeoStats>> {
    try {
      const response = await this.request<VideoWithStats>({
        method: 'GET',
        path: `/videos/${videoId}/stats`,
      })
      
      if (!response || !response.data || !response.data[0]) {
        throw new Error('Invalid response from Vimeo API')
      }
      
      return response.data[0].stats
    } catch (error) {
      console.error('Error fetching video stats:', error)
      throw error
    }
  }
  
  // ==================== Upload Management ====================
  
  /**
   * Begin the upload process and get upload URL
   */
  public async getUploadUrl(options: ExtendedVimeoUploadOptions): Promise<VimeoUploadResponse> {
    try {
      const response = await this.makeRequest<VimeoUploadResponse>('/me/videos', {
        method: 'POST',
        body: JSON.stringify({
          upload: {
            approach: 'tus',
            size: options.fileSize,
          },
          name: options.name,
          description: options.description,
          privacy: options.privacy || { view: 'nobody' },
        }),
      })
      
      return response
    } catch (error) {
      console.error('Error getting upload URL:', error)
      throw error
    }
  }
  
  /**
   * Upload a video using tus client
   */
  public async uploadVideo(
    file: File,
    options: ExtendedVimeoUploadOptions,
    onProgress?: (bytesUploaded: number, bytesTotal: number) => void
  ): Promise<string> {
    try {
      // Get the upload URL
      const uploadResponse = await this.getUploadUrl({
        ...options,
        fileSize: file.size,
      })
      
      if (!uploadResponse || !uploadResponse.upload || !uploadResponse.upload.upload_link) {
        throw new Error('Invalid upload response from Vimeo')
      }
      
      // Create a new tus upload
      return new Promise((resolve, reject) => {
        const upload = new tus.Upload(file, {
          endpoint: uploadResponse.upload.upload_link,
          retryDelays: [0, 3000, 5000, 10000, 20000],
          metadata: {
            filename: file.name,
            filetype: file.type,
          },
          onError: (error) => {
            console.error('Error during upload:', error)
            reject(error)
          },
          onProgress: onProgress,
          onSuccess: () => {
            // Once the upload is complete, resolve with the video URI
            resolve(uploadResponse.uri.split('/').pop() || '')
          },
        })
        
        // Start the upload
        upload.start()
      })
    } catch (error) {
      console.error('Error uploading video:', error)
      throw error
    }
  }
  
  // ==================== Folder Management ====================
  
  /**
   * Get folders
   */
  public async getFolders(): Promise<VimeoFolder[]> {
    try {
      const response = await this.request<VimeoFolder>({
        method: 'GET',
        path: '/me/folders',
      })
      
      if (Array.isArray(response.data)) {
        return response.data
      }
      
      return []
    } catch (error) {
      console.error('Error fetching folders:', error)
      return []
    }
  }

  /**
   * Create a new folder in Vimeo
   */
  async createFolder(name: string, parentFolderId?: string): Promise<VimeoFolder> {
    try {
      const path = parentFolderId 
        ? `/folders/${parentFolderId}/folders` 
        : '/folders';
      
      const response = await this.request({
        method: 'POST',
        path,
        body: { name }
      });
      
      // The response contains the folder data directly (not in a data array)
      if (response && response.data && 'uri' in response.data) {
        // Cast to VimeoFolder after validating required properties
        const folder = response.data;
        if (this.isVimeoFolder(folder)) {
          return folder;
        }
      }
      
      throw new Error('Failed to get valid folder data from response');
    } catch (error) {
      console.error('Error creating folder:', error);
      throw error;
    }
  }
  
  /**
   * Type guard to check if an object is a VimeoFolder
   */
  private isVimeoFolder(obj: unknown): obj is VimeoFolder {
    if (!obj || typeof obj !== 'object') return false;
    const folder = obj as Partial<VimeoFolder>;
    
    return (
      typeof folder.uri === 'string' &&
      typeof folder.name === 'string' &&
      typeof folder.created_time === 'string' &&
      typeof folder.modified_time === 'string' &&
      folder.user !== undefined &&
      folder.metadata !== undefined
    );
  }

  /**
   * Delete a folder from Vimeo
   */
  async deleteFolder(folderId: string): Promise<boolean> {
    try {
      await this.request({
        method: 'DELETE',
        path: `/folders/${folderId}`
      });
      
      return true;
    } catch (error) {
      console.error('Error deleting folder:', error);
      throw error;
    }
  }

  /**
   * Add a video to a folder
   */
  async addVideoToFolder(videoId: string, folderId: string): Promise<boolean> {
    try {
      await this.request({
        method: 'PUT',
        path: `/folders/${folderId}/videos/${videoId}`
      });
      
      return true;
    } catch (error) {
      console.error('Error adding video to folder:', error);
      throw error;
    }
  }

  /**
   * Remove a video from a folder
   */
  public async removeVideoFromFolder(videoId: string, folderId: string): Promise<void> {
    try {
      await this.request({
        method: 'DELETE',
        path: `/folders/${folderId}/videos/${videoId}`,
      })
    } catch (error) {
      console.error('Error removing video from folder:', error)
      throw error
    }
  }

  /**
   * Get account information
   */
  async getAccountInfo(): Promise<{ account_type?: string } | null> {
    try {
      const response = await this.clientRequest<{ account_type?: string }>({
        method: 'GET',
        path: '/me',
        query: {
          fields: 'account_type',
        },
      })
      
      if (response && response.data && response.data.length > 0) {
        return response.data[0]
      }
      
      return null
    } catch (error) {
      console.error('Error fetching account info:', error)
      return null
    }
  }
  
  /**
   * Update access rights for videos
   */
  async updateAccessRights(options: { 
    userId?: string,
    canAccess: boolean,
    maxQuality: string,
    tier?: string
  }): Promise<boolean> {
    try {
      if (!options) {
        throw new Error('Options required for updating access rights')
      }

      const { userId, canAccess, maxQuality, tier } = options
      
      console.log(`Updating Vimeo access rights for ${userId || 'all users'}: ${canAccess ? 'Granted' : 'Revoked'}, max quality: ${maxQuality}, tier: ${tier || 'N/A'}`)
      
      // In a real implementation, you would call the Vimeo API to update access rights
      // Either through domain level access control, or by updating specific video permissions
      
      // Example: If using domain-level access control
      if (userId) {
        // Update for a specific user
        await this.request({
          method: 'PUT',
          path: `/users/${userId}/access`,
          body: {
            access_type: canAccess ? 'allowed' : 'blocked',
            max_quality: maxQuality
          }
        })
      } else {
        // Update global access settings
        await this.request({
          method: 'PUT',
          path: '/me/domains',
          body: {
            domain_access_type: canAccess ? 'allowed' : 'blocked',
            max_quality_for_allowed_domains: maxQuality
          }
        })
      }
      
      return true
    } catch (error) {
      console.error('Error updating access rights:', error)
      return false
    }
  }

}

// Export singleton instance
export const vimeoService = VimeoService.getInstance()

// Export functions for backward compatibility
export const {
  getVideo,
  updateVideo,
  updateVideoProperties,
  deleteVideo,
  getVideos,
  getVideoStats,
  getUploadUrl,
  uploadVideo,
  getFolders,
  createFolder,
  deleteFolder,
  addVideoToFolder,
  removeVideoFromFolder,
  clientRequest,
  getAccountInfo,
  updateAccessRights
} = vimeoService
