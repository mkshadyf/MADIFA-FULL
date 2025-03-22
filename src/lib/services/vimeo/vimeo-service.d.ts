import type {
  VimeoFolder,
  VimeoPrivacy,
  VimeoVideo,
  VimeoStats,
  VimeoResponse,
  VimeoRequestOptions,
  ExtendedVimeoUploadOptions,
  VimeoUploadResponse
} from './types';

export declare class VimeoService {
  static getInstance(): VimeoService;

  // Video methods
  getVideo(videoId: string): Promise<VimeoVideo>;
  updateVideo(videoId: string, updates: Partial<VimeoVideo>): Promise<VimeoVideo>;
  updateVideoProperties(videoId: string, updates: { privacy?: Partial<VimeoPrivacy>; name?: string; description?: string }): Promise<boolean>;
  deleteVideo(videoId: string): Promise<void>;
  getVideos(options?: {
    page?: number;
    perPage?: number;
    query?: string;
    sort?: string;
    direction?: 'asc' | 'desc';
    folderId?: string;
  }): Promise<{ videos: VimeoVideo[]; total: number }>;
  getVideosByFolder(folderId: string): Promise<VimeoVideo[]>;
  getVideoStats(videoId: string): Promise<Partial<VimeoStats>>;

  // Upload methods
  getUploadUrl(options: ExtendedVimeoUploadOptions): Promise<VimeoUploadResponse>;
  uploadVideo(
    file: File,
    options: ExtendedVimeoUploadOptions,
    onProgress?: (bytesUploaded: number, bytesTotal: number) => void
  ): Promise<string>;

  // Folder methods
  getFolders(): Promise<VimeoFolder[]>;
  createFolder(name: string, parentFolderId?: string): Promise<VimeoFolder>;
  deleteFolder(folderId: string): Promise<boolean>;
  addVideoToFolder(videoId: string, folderId: string): Promise<boolean>;
  removeVideoFromFolder(videoId: string, folderId: string): Promise<void>;

  // Account methods
  getAccountInfo(): Promise<{ account_type?: string } | null>;

  // Access rights
  updateAccessRights(options: { 
    userId?: string;
    canAccess: boolean;
    maxQuality: string;
    tier?: string;
  }): Promise<boolean>;

  // API methods
  request<T>(options: VimeoRequestOptions): Promise<VimeoResponse<T>>;
  clientRequest<T>(options: VimeoRequestOptions): Promise<VimeoResponse<T>>;
  makeRequest<T>(endpoint: string, options?: { method?: string; headers?: Record<string, string>; body?: string }): Promise<T>;
}

export declare const vimeoService: VimeoService;

// Backward compatibility exports
export declare const getVideo: (videoId: string) => Promise<VimeoVideo>;
export declare const updateVideo: (videoId: string, updates: Partial<VimeoVideo>) => Promise<VimeoVideo>;
export declare const updateVideoProperties: (videoId: string, updates: { privacy?: Partial<VimeoPrivacy>; name?: string; description?: string }) => Promise<boolean>;
export declare const deleteVideo: (videoId: string) => Promise<void>;
export declare const getVideos: (options?: {
  page?: number;
  perPage?: number;
  query?: string;
  sort?: string;
  direction?: 'asc' | 'desc';
  folderId?: string;
}) => Promise<{ videos: VimeoVideo[]; total: number }>;
export declare const getVideoStats: (videoId: string) => Promise<Partial<VimeoStats>>;
export declare const getUploadUrl: (options: ExtendedVimeoUploadOptions) => Promise<VimeoUploadResponse>;
export declare const uploadVideo: (
  file: File,
  options: ExtendedVimeoUploadOptions,
  onProgress?: (bytesUploaded: number, bytesTotal: number) => void
) => Promise<string>;
export declare const getFolders: () => Promise<VimeoFolder[]>;
export declare const createFolder: (name: string, parentFolderId?: string) => Promise<VimeoFolder>;
export declare const deleteFolder: (folderId: string) => Promise<boolean>;
export declare const addVideoToFolder: (videoId: string, folderId: string) => Promise<boolean>;
export declare const removeVideoFromFolder: (videoId: string, folderId: string) => Promise<void>;
export declare const updateAccessRights: (options: { 
  userId?: string;
  canAccess: boolean;
  maxQuality: string;
  tier?: string;
}) => Promise<boolean>;
