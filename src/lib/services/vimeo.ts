import { env } from '@/lib/config/env';
import { createErrorContext, handleVimeoError } from '@/lib/utils/error-handler';
import type { VimeoError, VimeoUploadOptions, VimeoVideo } from '@/types/vimeo';

export class VimeoService {
  private readonly baseUrl = 'https://api.vimeo.com';
  private readonly accessToken: string;

  constructor(accessToken: string) {
    if (!accessToken) {
      throw new Error('Vimeo access token is required');
    }
    this.accessToken = accessToken;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = {
      'Authorization': `Bearer ${this.accessToken}`,
      'Content-Type': 'application/json',
      ...options.headers,
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (!response.ok) {
        const error = await response.json();
        throw {
          status: response.status,
          code: 'VIMEO_API_ERROR',
          message: error.error || 'Vimeo API error',
          developer_message: error.developer_message,
          error_code: error.error_code,
          name: 'VimeoError'
        } as VimeoError;
      }

      return response.json();
    } catch (error) {
      throw this.handleError(error, 'request', { url, method: options.method });
    }
  }

  async getVideo(id: string): Promise<VimeoVideo> {
    try {
      return await this.request<VimeoVideo>(`/videos/${id}`);
    } catch (error) {
      throw this.handleError(error, 'getVideo', { id });
    }
  }

  async uploadVideo(file: File, options: VimeoUploadOptions): Promise<VimeoVideo> {
    try {
      // First, create an upload ticket
      const ticket = await this.request<{ upload: { upload_link: string } }>('/me/videos', {
        method: 'POST',
        body: JSON.stringify({
          upload: { approach: 'tus', size: file.size },
          name: options.name,
          description: options.description,
          privacy: options.privacy,
          folder_id: options.folder_id
        }),
      });

      // Then upload the file using tus protocol
      // Implementation depends on your tus client
      // This is a placeholder for the actual implementation
      throw new Error('Upload implementation required');

    } catch (error) {
      throw this.handleError(error, 'uploadVideo', { fileName: file.name, ...options });
    }
  }

  private handleError(error: unknown, operation: string, details?: unknown): VimeoError {
    const context = createErrorContext('VimeoService', operation, details);
    return handleVimeoError(error, context);
  }
}

export const vimeoService = new VimeoService(env.VITE_VIMEO_ACCESS_TOKEN);

// ... existing code ...
