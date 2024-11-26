

import Image from 'react-router-dom'
import { motion } from 'framer-motion'

interface WelcomeStepProps {
  onNext: () => void
}

export function WelcomeStep({ onNext }: WelcomeStepProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="text-center max-w-2xl mx-auto px-4"
    >
      <motion.div 
        className="mb-12"
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        <Image
          src="/images/welcome-illustration.svg"
          alt="Welcome"
          width={400}
          height={400}
          className="mx-auto drop-shadow-2xl"
          priority
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.5 }}
      >
        <h2 className="text-3xl font-bold mb-6 bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent">
          Welcome to Your Entertainment Journey
        </h2>
        
        <p className="text-gray-400 mb-8 text-lg">
          Discover amazing African content tailored just for you
        </p>

        <motion.button
          onClick={onNext}
          className="btn-primary px-8 py-3 text-lg font-semibold rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Get Started..
        </motion.button>
      </motion.div>
    </motion.div>
  )
}
