import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { vi } from 'vitest'
import { BatchUploader } from './BatchUploader'
import { vimeoService } from '@/lib/services/vimeo'
import type { VimeoUploadOptions } from '@/types/vimeo'

// Mock vimeoService
vi.mock('@/lib/services/vimeo', () => ({
  vimeoService: {
    uploadVideo: vi.fn().mockResolvedValue('video123')
  }
}))

describe('BatchUploader', () => {
  const mockOnComplete = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders upload area', () => {
    render(<BatchUploader onComplete={mockOnComplete} />)
    expect(screen.getByLabelText('Upload videos')).toBeInTheDocument()
    expect(screen.getByText(/Drag & drop videos here/)).toBeInTheDocument()
  })

  it('handles file upload', async () => {
    const file = new File(['test'], 'test.mp4', { type: 'video/mp4' })
    vi.mocked(vimeoService.uploadVideo).mockResolvedValueOnce('video123')

    render(<BatchUploader onComplete={mockOnComplete} />)
    const input = screen.getByLabelText('Upload videos')

    await waitFor(() => {
      fireEvent.change(input, { target: { files: [file] } })
    })

    expect(vimeoService.uploadVideo).toHaveBeenCalledWith(
      file,
      expect.objectContaining({
        name: 'test',
        privacy: expect.objectContaining({
          view: 'disable',
          embed: 'private',
          comments: 'nobody',
          download: false,
          add: false
        })
      }),
      expect.any(Function)
    )

    await waitFor(() => {
      expect(mockOnComplete).toHaveBeenCalled()
    })
  })

  it('shows progress bar during upload', async () => {
    const file = new File(['test'], 'test.mp4', { type: 'video/mp4' })
    let progressCallback: ((progress: { bytesUploaded: number; bytesTotal: number; percentage: number }) => void) | undefined

    vi.mocked(vimeoService.uploadVideo).mockImplementationOnce(
      (file: File, options: VimeoUploadOptions, onProgress?: typeof progressCallback) => {
        if (onProgress) {
          progressCallback = onProgress
          onProgress({ bytesUploaded: 50, bytesTotal: 100, percentage: 50 })
        }
        return Promise.resolve('video123')
      }
    )

    render(<BatchUploader onComplete={mockOnComplete} />)
    const input = screen.getByLabelText('Upload videos')

    await waitFor(() => {
      fireEvent.change(input, { target: { files: [file] } })
    })

    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '50')
  })
}) 