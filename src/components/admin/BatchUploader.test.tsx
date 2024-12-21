import React from "react"
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { vi, describe, it, beforeEach, expect } from 'vitest'
import { BatchUploader } from './BatchUploader'
import type { vimeoService } from '@/lib/services/vimeo'

// Mock VimeoService
class MockUploadService {
  async uploadVideo(
    _file: File,
    options: { onProgress: (progress: { percent: number }) => void }
  ) {
    // Simulate upload progress
    options.onProgress({ percent: 50 })
    await new Promise(resolve => {
      global.setTimeout(resolve, 100)
    })
    options.onProgress({ percent: 100 })
    return 'https://vimeo.com/123456'
  }

  async getVideoStatus(_videoId: string) {
    return {
      status: 'available',
      progress: 100,
    }
  }
}

describe('BatchUploader', () => {
  const mockOnComplete = vi.fn()
  const mockUploadService = new MockUploadService()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders upload area with correct text', () => {
    render(
      <BatchUploader
        onComplete={mockOnComplete}
        uploadService={mockUploadService as unknown as typeof vimeoService}
      />
    )

    expect(
      screen.getByText(
        'Drag and drop video files here, or click to select files'
      )
    ).toBeInTheDocument()
  })

  it('shows accepted file formats', () => {
    const acceptedTypes = ['.mp4', '.mov']
    render(
      <BatchUploader
        onComplete={mockOnComplete}
        acceptedFileTypes={acceptedTypes}
        uploadService={mockUploadService as unknown as typeof vimeoService}
      />
    )

    expect(
      screen.getByText(`Accepted formats: ${acceptedTypes.join(', ')}`)
    ).toBeInTheDocument()
  })

  it('shows max file size', () => {
    const maxSize = 100 * 1024 * 1024 // 100MB
    render(
      <BatchUploader
        onComplete={mockOnComplete}
        maxFileSize={maxSize}
        uploadService={mockUploadService as unknown as typeof vimeoService}
      />
    )

    expect(screen.getByText('Maximum file size: 100MB')).toBeInTheDocument()
  })

  it('handles file upload successfully', async () => {
    render(
      <BatchUploader
        onComplete={mockOnComplete}
        uploadService={mockUploadService as unknown as typeof vimeoService}
      />
    )

    const file = new File(['test content'], 'test.mp4', { type: 'video/mp4' })
    const dropzone = screen.getByText(
      'Drag and drop video files here, or click to select files'
    ).parentElement!

    fireEvent.drop(dropzone, {
      dataTransfer: {
        files: [file],
      },
    })

    await waitFor(() => {
      expect(screen.getByText('test.mp4')).toBeInTheDocument()
      expect(screen.getByText('available')).toBeInTheDocument()
    })

    expect(mockOnComplete).toHaveBeenCalled()
  })

  it('handles file size limit', async () => {
    const maxSize = 1024 // 1KB
    render(
      <BatchUploader
        onComplete={mockOnComplete}
        maxFileSize={maxSize}
        uploadService={mockUploadService as unknown as typeof vimeoService}
      />
    )

    // Create a file larger than maxSize
    const largeFile = new File(['x'.repeat(maxSize + 1)], 'large.mp4', {
      type: 'video/mp4',
    })
    const dropzone = screen.getByText(
      'Drag and drop video files here, or click to select files'
    ).parentElement!

    fireEvent.drop(dropzone, {
      dataTransfer: {
        files: [largeFile],
      },
    })

    await waitFor(() => {
      expect(screen.getByText('error')).toBeInTheDocument()
      expect(
        screen.getByText(/File size exceeds maximum limit/)
      ).toBeInTheDocument()
    })
  })

  it('handles multiple files upload', async () => {
    render(
      <BatchUploader
        onComplete={mockOnComplete}
        uploadService={mockUploadService as unknown as typeof vimeoService}
      />
    )

    const files = [
      new File(['content1'], 'test1.mp4', { type: 'video/mp4' }),
      new File(['content2'], 'test2.mp4', { type: 'video/mp4' }),
    ]

    const dropzone = screen.getByText(
      'Drag and drop video files here, or click to select files'
    ).parentElement!

    fireEvent.drop(dropzone, {
      dataTransfer: {
        files,
      },
    })

    await waitFor(() => {
      expect(screen.getByText('test1.mp4')).toBeInTheDocument()
      expect(screen.getByText('test2.mp4')).toBeInTheDocument()
      expect(screen.getAllByText('available')).toHaveLength(2)
    })

    expect(mockOnComplete).toHaveBeenCalled()
  })

  it('disables dropzone while uploading', async () => {
    render(
      <BatchUploader
        onComplete={mockOnComplete}
        uploadService={mockUploadService as unknown as typeof vimeoService}
      />
    )

    const file = new File(['test content'], 'test.mp4', { type: 'video/mp4' })
    const dropzone = screen.getByText(
      'Drag and drop video files here, or click to select files'
    ).parentElement!

    fireEvent.drop(dropzone, {
      dataTransfer: {
        files: [file],
      },
    })

    // Check for disabled state during upload
    expect(dropzone.className).toContain('cursor-not-allowed')
    expect(dropzone.className).toContain('opacity-50')

    await waitFor(() => {
      expect(screen.getByText('available')).toBeInTheDocument()
    })

    // Check that dropzone is enabled after upload
    expect(dropzone.className).not.toContain('cursor-not-allowed')
    expect(dropzone.className).not.toContain('opacity-50')
  })
})
