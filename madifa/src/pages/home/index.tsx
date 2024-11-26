import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/providers/AuthProvider'

export default function HomePage() {
  const navigate = useNavigate()
  const { user } = useAuth()

  React.useEffect(() => {
    if (user) {
      navigate('/browse')
    }
  }, [user, navigate])

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center">
      <div className="max-w-3xl mx-auto text-center px-4">
        <h1 className="text-5xl font-bold text-white mb-6">
          Welcome to <span className="text-gradient">Madifa</span>
        </h1>
        <p className="text-xl text-gray-300 mb-8">
          Your premium streaming platform for movies, series, and music.
        </p>
        <div className="space-x-4">
          <button
            onClick={() => navigate('/auth/signin')}
            className="btn-primary px-8 py-3 text-lg font-medium text-white"
          >
            Get Started
          </button>
        </div>
      </div>
    </div>
  )
} 