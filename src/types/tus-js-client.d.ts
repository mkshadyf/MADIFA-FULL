declare module 'tus-js-client' {
  export interface UploadOptions {
    endpoint: string
    retryDelays?: number[]
    metadata?: Record<string, string>
    onError?: (error: Error) => void
    onProgress?: (bytesUploaded: number, bytesTotal: number) => void
    onSuccess?: () => void
    headers?: Record<string, string>
    chunkSize?: number
    uploadUrl?: string
    uploadSize?: number
    overridePatchMethod?: boolean
    removeFingerprintOnSuccess?: boolean
    fingerprint?: (file: File, options: UploadOptions) => Promise<string>
  }

  export class Upload {
    constructor(file: File | Blob, options: UploadOptions)
    start(): void
    abort(shouldTerminate?: boolean): Promise<void>
    findPreviousUploads(): Promise<Array<{ uploadUrl: string; size: number }>>
    resumeFromPreviousUpload(previousUpload: { uploadUrl: string }): void
    on(event: 'error' | 'success' | 'progress', callback: Function): void
    url: string | null
  }

  export const isSupported: boolean
  export const canStoreURLs: boolean
  export const defaultOptions: Partial<UploadOptions>
} 