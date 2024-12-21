import React from 'react'
import { motion } from 'framer-motion'

import type { OnboardingState } from '@/lib/services/onboarding'

interface OnboardingContentProps {
  currentStep: OnboardingState['step']
  children: React.ReactNode
}

export default function OnboardingContent({
  currentStep,
  children,
}: OnboardingContentProps) {
  return (
    <motion.div
      key={currentStep}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="mx-auto max-w-3xl px-4 py-8"
    >
      {children}
    </motion.div>
  )
}
