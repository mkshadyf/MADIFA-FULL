import React from 'react'

interface LoadingStateProps {
  text?: string
  className?: string
}

export default function LoadingState({ 
  text = 'Loading...', 
  className = '' 
}: LoadingStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center p-8 ${className}`}>
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-500 border-t-transparent" />
      <p className="mt-4 text-gray-400">{text}</p>
    </div>
  )
} 