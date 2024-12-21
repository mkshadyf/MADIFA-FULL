import React from 'react'
import { type FC } from 'react'
import { useAuth } from '@/providers/AuthProvider'

import { LoadingSpinner } from '@/components/ui/LoadingSpinner'

interface SettingsPageProps {
  // Add any props if needed
}

const SettingsPage: FC<SettingsPageProps> = () => {
  const { isLoading } = useAuth()

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
