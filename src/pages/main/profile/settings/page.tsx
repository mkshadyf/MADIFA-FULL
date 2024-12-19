import { type FC } from 'react'
import { useAuth } from '@/providers/AuthProvider'

import { captureException } from '@/lib/services/sentry'
import { userService, type UserPreferences } from '@/lib/services/user'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'

interface SettingsPageProps {
  // Add any props if needed
}

const SettingsPage: FC<SettingsPageProps> = () => {
  const { user, isLoading } = useAuth()

  const handleUpdatePreferences = async (
    preferences: Partial<UserPreferences>
  ): Promise<void> => {
    if (!user) return

    try {
      await userService.updatePreferences(user.id, {
        email_notifications: preferences.email_notifications ?? true,
        autoplay: preferences.autoplay ?? true,
        default_quality: preferences.default_quality ?? '720p',
        subtitle_language: preferences.subtitle_language ?? 'en',
        audio_language: preferences.audio_language ?? 'en',
        content_restrictions: preferences.content_restrictions ?? {
          max_rating: 'PG-13',
          restricted_categories: [],
        },
      })
    } catch (error) {
      captureException(
        error instanceof Error
          ? error
          : new Error('Failed to update preferences'),
        {
          userId: user.id,
          preferences,
        }
      )
      throw error
    }
  }

  if (isLoading) {
    return <LoadingSpinner />
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold">Settings</h1>
      {/* Add your settings form here */}
    </div>
  )
}

export default SettingsPage
