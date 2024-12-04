import React from 'react'

interface LoadingSpinnerProps {
  className?: string
}

export default function LoadingSpinner({ className = '' }: LoadingSpinnerProps) {
  return (
    <div className={`animate-spin rounded-full border-4 border-t-transparent ${className}`} />
  )
} 