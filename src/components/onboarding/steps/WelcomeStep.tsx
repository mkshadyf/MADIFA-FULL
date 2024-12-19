import { motion } from 'framer-motion'

import type { OnboardingState } from '@/lib/services/onboarding'
import { Button } from '@/components/ui/button'

interface WelcomeStepProps {
  onNext: (data: Partial<OnboardingState>) => Promise<void>
  data: Partial<OnboardingState>
}

export default function WelcomeStep({ onNext, data }: WelcomeStepProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 text-center"
    >
      <h1 className="text-4xl font-bold text-white">Welcome to Madifa</h1>

      <p className="mx-auto max-w-2xl text-xl text-gray-400">
        Your premium streaming experience starts here. Let's get your account
        set up in just a few steps.
      </p>

      <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
        <FeatureCard
          icon="🎬"
          title="Premium Content"
          description="Access exclusive movies, series, and documentaries"
        />
        <FeatureCard
          icon="📱"
          title="Watch Anywhere"
          description="Stream on any device, anytime"
        />
        <FeatureCard
          icon="🌟"
          title="High Quality"
          description="Enjoy content in up to 4K HDR quality"
        />
      </div>

      <div className="mt-12">
        <Button size="lg" onClick={() => onNext({})}>
          Get Started
        </Button>
      </div>
    </motion.div>
  )
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: string
  title: string
  description: string
}) {
  return (
    <div className="rounded-xl bg-gray-800/50 p-6">
      <div className="mb-4 text-4xl">{icon}</div>
      <h3 className="mb-2 text-lg font-semibold text-white">{title}</h3>
      <p className="text-gray-400">{description}</p>
    </div>
  )
}
