export interface FileUploadService {
  uploadFile: (file: File) => Promise<{ success: boolean }>
  getUploadProgress: () => number
}

export class DefaultUploadService implements FileUploadService {
  private progress = 0

  async uploadFile(file: File): Promise<{ success: boolean }> {
    // Simulate upload progress
    this.progress = 0

    // Upload in 10 chunks
    for (let i = 0; i < 10; i++) {
      await new Promise(resolve => setTimeout(resolve, 500))
      this.progress = Math.min((i + 1) * 10, 100)
    }

    return { success: true }
  }

  getUploadProgress(): number {
    return this.progress
  }
}
