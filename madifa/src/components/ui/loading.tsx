import React from 'react'

interface LoadingProps {
  message?: string
  fullScreen?: boolean
  className?: string
}

export default function Loading({ message = 'Loading...', fullScreen = false, className = '' }: LoadingProps) {
  const containerClasses = fullScreen
    ? 'fixed inset-0 bg-gray-900/50 backdrop-blur-sm'
    : 'w-full h-full'

  return (
    <div className={`${containerClasses} flex items-center justify-center ${className}`}>
      <div className="flex flex-col items-center space-y-4">
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 border-4 border-indigo-200 rounded-full animate-pulse"></div>
          <div className="absolute inset-0 border-4 border-indigo-600 rounded-full animate-spin border-t-transparent"></div>
        </div>
        {message && (
          <p className="text-gray-200 text-sm font-medium">{message}</p>
        )}
      </div>
    </div>
  )
}

export function LoadingSpinner() {
  return (
    <div className="w-8 h-8 border-3 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
  )
} 
