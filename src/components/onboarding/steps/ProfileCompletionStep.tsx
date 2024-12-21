import React from 'react'
import { useState } from 'react'
import { useAuth } from '@/providers/AuthProvider'
import { motion } from 'framer-motion'

import type { OnboardingState } from '@/lib/services/onboarding'
import type { UserProfile } from '@/types/auth'
import type { StreamingQuality } from '@/types/onboarding'
import { useToast } from '@/hooks/useToast'
import { Button } from '@/components/ui/button'

interface ProfileCompletionStepProps {
  onNext: (data: Partial<OnboardingState>) => Promise<void>
  onBack: () => void
  data: Partial<OnboardingState>
}

interface ProfileForm {
  fullName: string
  displayName: string
  genres: string[]
  languages: string[]
  notifications: boolean
  quality: StreamingQuality
}

const AVAILABLE_GENRES = [
  'Action',
  'Comedy',
  'Drama',
  'Documentary',
  'Horror',
  'Sci-Fi',
  'Thriller',
  'Romance',
  'Animation',
]

const AVAILABLE_LANGUAGES = [
  'English',
  'Spanish',
  'French',
  'German',
  'Italian',
  'Portuguese',
  'Chinese',
  'Japanese',
  'Korean',
]

export default function ProfileCompletionStep({
  onNext,
  onBack,
  data,
}: ProfileCompletionStepProps) {
  const [form, setForm] = useState<ProfileForm>({
    fullName: data.profile?.fullName || '',
    displayName: data.profile?.displayName || '',
    genres: data.preferences?.genres || [],
    languages: data.preferences?.languages || [],
    notifications: data.preferences?.notifications ?? true,
    quality: data.preferences?.quality || 'auto',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { updateProfile } = useAuth()
  const { showToast } = useToast()

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true)

      if (!form.fullName || !form.displayName) {
        showToast('Please fill in all required fields', 'error')
        return
      }

      await updateProfile({
        full_name: form.fullName,
        display_name: form.displayName,
      } as Partial<UserProfile>)

      await onNext({
        profile: {
          fullName: form.fullName,
          displayName: form.displayName,
        },
        preferences: {
          genres: form.genres,
          languages: form.languages,
          notifications: form.notifications,
          quality: form.quality,
        },
      })
    } catch (error) {
      console.error('Error updating profile:', error)
      showToast('Failed to update profile', 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white">Complete Your Profile</h2>
        <p className="mt-2 text-gray-400">
          Help us personalize your experience
        </p>
      </div>

      <div className="mx-auto max-w-2xl space-y-6">
        {/* Basic Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-white">Basic Information</h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-400">
                Full Name
              </label>
              <input
                aria-label="fullName"
                type="text"
                value={form.fullName}
                onChange={e =>
                  setForm(prev => ({ ...prev, fullName: e.target.value }))
                }
                className="mt-1 block w-full rounded-md border border-gray-700 bg-gray-800 
                         px-4 py-2 text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400">
                Display Name
              </label>
              <input
                aria-label="displayName"
                type="text"
                value={form.displayName}
                onChange={e =>
                  setForm(prev => ({ ...prev, displayName: e.target.value }))
                }
                className="mt-1 block w-full rounded-md border border-gray-700 bg-gray-800 
                         px-4 py-2 text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Preferences */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-white">Preferences</h3>

          {/* Genres */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-400">
              Favorite Genres
            </label>
            <div className="flex flex-wrap gap-2">
              {AVAILABLE_GENRES.map(genre => (
                <button
                  key={genre}
                  onClick={() =>
                    setForm(prev => ({
                      ...prev,
                      genres: prev.genres.includes(genre)
                        ? prev.genres.filter(g => g !== genre)
                        : [...prev.genres, genre],
                    }))
                  }
                  className={`rounded-full px-3 py-1 text-sm transition-colors
                    ${
                      form.genres.includes(genre)
                        ? 'bg-indigo-500 text-white'
                        : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                    }`}
                >
                  {genre}
                </button>
              ))}
            </div>
          </div>

          {/* Languages */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-400">
              Preferred Languages
            </label>
            <div className="flex flex-wrap gap-2">
              {AVAILABLE_LANGUAGES.map(language => (
                <button
                  key={language}
                  onClick={() =>
                    setForm(prev => ({
                      ...prev,
                      languages: prev.languages.includes(language)
                        ? prev.languages.filter(l => l !== language)
                        : [...prev.languages, language],
                    }))
                  }
                  className={`rounded-full px-3 py-1 text-sm transition-colors
                    ${
                      form.languages.includes(language)
                        ? 'bg-indigo-500 text-white'
                        : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                    }`}
                >
                  {language}
                </button>
              ))}
            </div>
          </div>

          {/* Streaming Quality */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-400">
              Preferred Streaming Quality
            </label>
            <select
              aria-label="streamingQuality"
              value={form.quality}
              onChange={e =>
                setForm(prev => ({
                  ...prev,
                  quality: e.target.value as ProfileForm['quality'],
                }))
              }
              className="mt-1 block w-full rounded-md border border-gray-700 bg-gray-800 
                       px-4 py-2 text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            >
              <option value="auto">Auto (Recommended)</option>
              <option value="low">Low (Data Saver)</option>
              <option value="medium">Medium</option>
              <option value="high">High (Best Quality)</option>
            </select>
          </div>

          {/* Notifications */}
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="notifications"
              aria-label="notifications"
              checked={form.notifications}
              onChange={e =>
                setForm(prev => ({
                  ...prev,
                  notifications: e.target.checked,
                }))
              }
              className="h-4 w-4 rounded border-gray-700 bg-gray-800 
                       text-indigo-500 focus:ring-indigo-500"
            />
            <label htmlFor="notifications" className="text-sm text-gray-400">
              Receive notifications about new content and updates
            </label>
          </div>
        </div>
      </div>

      <div className="mt-8 flex justify-between">
        <Button variant="secondary" onClick={onBack}>
          Back
        </Button>
        <Button
          variant="primary"
          onClick={handleSubmit}
          loading={isSubmitting}
          disabled={!form.fullName || !form.displayName}
        >
          Complete Setup
        </Button>
      </div>
    </motion.div>
  )
}
