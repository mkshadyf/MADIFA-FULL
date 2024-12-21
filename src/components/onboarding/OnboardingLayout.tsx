import React from "react"
import { motion } from 'framer-motion'

interface OnboardingLayoutProps {
  children: React.ReactNode
}

export default function OnboardingLayout({ children }: OnboardingLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-900">
      <div className="mx-auto max-w-7xl px-4 py-12">{children}</div>
    </div>
  )
}
