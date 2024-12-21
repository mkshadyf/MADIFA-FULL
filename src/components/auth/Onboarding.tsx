import React from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'

const steps = [
  {
    title: 'Welcome to Madifa',
    description:
      'Your premium streaming platform for movies, series, and music.',
    image: '/images/onboarding/welcome.png',
  },
  {
    title: 'Watch Anywhere',
    description: 'Stream your favorite content on any device, anytime.',
    image: '/images/onboarding/devices.png',
  },
  {
    title: 'Premium Content',
    description: 'Access exclusive content with our premium subscription.',
    image: '/images/onboarding/premium.png',
  },
]

export default function Onboarding() {
  const [currentStep, setCurrentStep] = React.useState(0)
  const navigate = useNavigate()

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1)
    } else {
      navigate('/auth/signup')
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-gray-900">
      <motion.div
        className="flex flex-1 flex-col items-center justify-center p-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <img
          src={steps[currentStep].image}
          alt={steps[currentStep].title}
          className="mb-8 h-64 w-64 object-contain"
        />
        <h1 className="mb-4 text-center text-3xl font-bold text-white">
          {steps[currentStep].title}
        </h1>
        <p className="mb-8 max-w-md text-center text-gray-400">
          {steps[currentStep].description}
        </p>

        <div className="mb-8 flex space-x-2">
          {steps.map((_, index) => (
            <div
              key={index}
              className={`h-2 w-2 rounded-full ${
                index === currentStep ? 'bg-indigo-500' : 'bg-gray-700'
              }`}
            />
          ))}
        </div>

        <button
          onClick={nextStep}
          className="w-full max-w-xs rounded-lg bg-indigo-600 px-4 py-3 font-medium text-white transition-colors hover:bg-indigo-500"
        >
          {currentStep === steps.length - 1 ? 'Get Started' : 'Next'}
        </button>
      </motion.div>
    </div>
  )
}
