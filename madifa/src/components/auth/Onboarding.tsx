import React from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'

const steps = [
  {
    title: 'Welcome to Madifa',
    description: 'Your premium streaming platform for movies, series, and music.',
    image: '/images/onboarding/welcome.png'
  },
  {
    title: 'Watch Anywhere',
    description: 'Stream your favorite content on any device, anytime.',
    image: '/images/onboarding/devices.png'
  },
  {
    title: 'Premium Content',
    description: 'Access exclusive content with our premium subscription.',
    image: '/images/onboarding/premium.png'
  }
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
    <div className="min-h-screen bg-gray-900 flex flex-col">
      <motion.div 
        className="flex-1 flex flex-col items-center justify-center p-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <img
          src={steps[currentStep].image}
          alt={steps[currentStep].title}
          className="w-64 h-64 object-contain mb-8"
        />
        <h1 className="text-3xl font-bold text-white text-center mb-4">
          {steps[currentStep].title}
        </h1>
        <p className="text-gray-400 text-center max-w-md mb-8">
          {steps[currentStep].description}
        </p>
        
        <div className="flex space-x-2 mb-8">
          {steps.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full ${
                index === currentStep ? 'bg-indigo-500' : 'bg-gray-700'
              }`}
            />
          ))}
        </div>

        <button
          onClick={nextStep}
          className="w-full max-w-xs bg-indigo-600 text-white rounded-lg px-4 py-3 font-medium hover:bg-indigo-500 transition-colors"
        >
          {currentStep === steps.length - 1 ? 'Get Started' : 'Next'}
        </button>
      </motion.div>
    </div>
  )
} 