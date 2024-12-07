import { motion } from 'framer-motion'
import { Button } from '@/components/ui/Button'
import type { OnboardingState } from '@/lib/services/onboarding'

interface WelcomeStepProps {
  onNext: (data: Partial<OnboardingState>) => Promise<void>
  data: Partial<OnboardingState>
}

export default function WelcomeStep({ onNext, data }: WelcomeStepProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center space-y-6"
    >
      <h1 className="text-4xl font-bold text-white">
        Welcome to Madifa
      </h1>
      
      <p className="text-xl text-gray-400 max-w-2xl mx-auto">
        Your premium streaming experience starts here. Let's get your account set up
        in just a few steps.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
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
        <Button
          size="lg"
          onClick={() => onNext({})}
        >
          Get Started
        </Button>
      </div>
    </motion.div>
  )
}

function FeatureCard({ icon, title, description }: { 
  icon: string
  title: string
  description: string 
}) {
  return (
    <div className="bg-gray-800/50 p-6 rounded-xl">
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
      <p className="text-gray-400">{description}</p>
    </div>
  )
}
