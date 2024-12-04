import Image from 'react-router-dom'
import { motion } from 'framer-motion'

interface WelcomeStepProps {
  onNext: () => void
}

export default function WelcomeStep({ onNext }: WelcomeStepProps) {
  return (
    <div className="text-center space-y-6">
      <h1 className="text-3xl font-bold text-white">Welcome to Madifa</h1>
      <p className="text-gray-400 max-w-md mx-auto">
        Get ready to experience the best streaming content. Let's set up your account
        in just a few steps.
      </p>
      <button
        onClick={onNext}
        className="px-6 py-3 bg-indigo-600 text-white rounded-lg
                 hover:bg-indigo-700 transition-colors"
      >
        Get Started
      </button>
    </div>
  )
}
