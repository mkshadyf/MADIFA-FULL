import { Button } from '@/components/ui/button'
import { Form, Input, Select, Textarea } from '@/components/ui/form'
import { Modal } from '@/components/ui/modal'
import type { Content } from '@/types/content'
import React from 'react'

interface ContentFormData {
  title: string
  description: string
  metadata: {
    category: string
    release_date: string
    duration: number
    language: string
    tags?: string[]
  }
}

interface ContentFormModalProps {
  content?: Content | null
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: ContentFormData) => Promise<void>
  onSuccess?: () => void
}

export default function ContentFormModal({
  content,
  isOpen,
  onClose,
  onSubmit,
}: ContentFormModalProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [error, setError] = React.useState('')

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')

    try {
      const formData = new FormData(e.currentTarget)
      const data: ContentFormData = {
        title: formData.get('title') as string,
        description: formData.get('description') as string,
        metadata: {
          category: formData.get('category') as string,
          release_date: formData.get('release_date') as string,
          duration: parseInt(formData.get('duration') as string, 10),
          language: formData.get('language') as string,
          tags: (formData.get('tags') as string)
            .split(',')
            .map(tag => tag.trim())
            .filter(Boolean),
        },
      }

      await onSubmit(data)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save content')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={content ? 'Edit Content' : 'Add New Content'}
      size="lg"
    >
      <Form onSubmit={handleSubmit} error={error || undefined}>
        <Input
          label="Title"
          name="title"
          defaultValue={content?.title || ''}
          required
          autoFocus
        />

        <Textarea
          label="Description"
          name="description"
          defaultValue={content?.description || ''}
          required
        />

        <Select
          label="Category"
          name="category"
          defaultValue={content?.metadata?.category || ''}
          required
          options={[
            { value: 'movie', label: 'Movie' },
            { value: 'series', label: 'Series' },
            { value: 'documentary', label: 'Documentary' },
            { value: 'tutorial', label: 'Tutorial' },
          ]}
        />

        <Input
          label="Tags"
          name="tags"
          defaultValue={content?.metadata?.tags?.join(', ') || ''}
          placeholder="Enter tags separated by commas"
        />

        <Input
          label="Release Date"
          name="release_date"
          type="date"
          defaultValue={content?.metadata?.release_date || ''}
          required
        />

        <Input
          label="Duration (seconds)"
          name="duration"
          type="number"
          defaultValue={content?.metadata?.duration || 0}
          required
          min={0}
        />

        <Select
          label="Language"
          name="language"
          defaultValue={content?.metadata?.language || ''}
          required
          options={[
            { value: 'en', label: 'English' },
            { value: 'es', label: 'Spanish' },
            { value: 'fr', label: 'French' },
            { value: 'de', label: 'German' },
            { value: 'it', label: 'Italian' },
            { value: 'pt', label: 'Portuguese' },
            { value: 'ru', label: 'Russian' },
            { value: 'zh', label: 'Chinese' },
            { value: 'ja', label: 'Japanese' },
            { value: 'ko', label: 'Korean' },
          ]}
        />

        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={onClose} type="button">
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : content ? 'Update' : 'Create'}
          </Button>
        </div>
      </Form>
    </Modal>
  )
}
