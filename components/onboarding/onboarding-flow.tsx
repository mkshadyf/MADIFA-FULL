'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { WelcomeStep } from './steps/WelcomeStep'
import { GenreSelectionStep } from './steps/GenreSelectionStep'
import { LanguageSelectionStep } from './steps/LanguageSelectionStep'
import { SettingsStep } from './steps/SettingsStep'

interface OnboardingPreferences {
  genres: string[]
  languages: string[]
  notifications: boolean
  quality: '480p' | '720p' | '1080p'
}

interface OnboardingStepProps {
  onNext: () => void
  onBack?: () => void
  preferences: OnboardingPreferences
  onUpdatePreferences: (preferences: Partial<OnboardingPreferences>) => void
}

interface OnboardingStep {
  id: string
  title: string
  description: string
  component: React.ReactNode
}

export default function OnboardingFlow() {
  const [currentStep, setCurrentStep] = useState(0)
  const [preferences, setPreferences] = useState<OnboardingPreferences>({
    genres: [],
    languages: [],
    notifications: true,
    quality: '1080p'
  })
  const router = useRouter()
  const supabase = createClient()

  const handleComplete = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user?.id) throw new Error('No user found')

      const { error } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: user.id,
          genres: preferences.genres,
          languages: preferences.languages,
          notifications_enabled: preferences.notifications,
          preferred_quality: preferences.quality,
          onboarding_completed: true
        })

      if (error) throw error
      router.push('/browse')
    } catch (error) {
      console.error('Error saving preferences:', error)
    }
  }

  const steps: OnboardingStep[] = [
    {
      id: 'welcome',
      title: 'Welcome to MADIFA',
      description: 'Let\'s personalize your experience',
      component: <WelcomeStep onNext={() => setCurrentStep(1)} />
    },
    {
      id: 'genres',
      title: 'Pick Your Favorites',
      description: 'Select genres you love to watch',
      component: (
        <GenreSelectionStep
          selectedGenres={preferences.genres}
          onSelect={(genres) => setPreferences({ ...preferences, genres })}
          onNext={() => setCurrentStep(2)}
          onBack={() => setCurrentStep(0)}
        />
      )
    },
    {
      id: 'languages',
      title: 'Language Preferences',
      description: 'Choose your preferred languages',
      component: (
        <LanguageSelectionStep
          selectedLanguages={preferences.languages}
          onSelect={(languages) => setPreferences({ ...preferences, languages })}
          onNext={() => setCurrentStep(3)}
          onBack={() => setCurrentStep(1)}
        />
      )
    },
    {
      id: 'settings',
      title: 'Almost Done',
      description: 'Configure your streaming settings',
      component: (
        <SettingsStep
          settings={{
            notifications: preferences.notifications,
            quality: preferences.quality
          }}
          onUpdate={(settings) => {
            const quality = settings.quality as '480p' | '720p' | '1080p'
            setPreferences({ ...preferences, notifications: settings.notifications, quality })
          }}
          onComplete={handleComplete}
          onBack={() => setCurrentStep(2)}
        />
      )
    }
  ]

  return (
    <div className="min-h-screen bg-[rgb(var(--background))]">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold text-white mb-4">
                {steps[currentStep].title}
              </h1>
              <p className="text-gray-400 text-lg">
                {steps[currentStep].description}
              </p>
            </div>

            {steps[currentStep].component}

            {/* Progress Indicator */}
            <div className="flex justify-center mt-8 space-x-2">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={`h-2 w-2 rounded-full transition-colors duration-200 ${
                    index === currentStep
                      ? 'bg-indigo-500'
                      : index < currentStep
                      ? 'bg-indigo-800'
                      : 'bg-gray-700'
                  }`}
                />
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
} 