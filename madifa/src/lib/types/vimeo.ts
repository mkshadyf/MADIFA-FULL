export interface VimeoUploadOptions {
  name: string;
  description?: string;
  folderUri?: string;
  privacy?: {
    view: 'anybody' | 'disable' | 'unlisted' | 'nobody' | 'password';
    embed?: 'public' | 'private';
    comments?: 'anybody' | 'nobody';
    download?: boolean;
  };
  onProgress?: (progress: {
    loaded: number;
    total: number;
    percent: number;
  }) => void;
}
