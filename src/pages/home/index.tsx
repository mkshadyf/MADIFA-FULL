import React from 'react'
import { useAuth } from '@/providers/AuthProvider'
import { useNavigate } from 'react-router-dom'

export default function HomePage() {
  const navigate = useNavigate()
  const { user } = useAuth()

  React.useEffect(() => {
    if (user) {
      navigate('/browse')
    }
  }, [user, navigate])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-900">
      <div className="mx-auto max-w-3xl px-4 text-center">
        <h1 className="mb-6 text-5xl font-bold text-white">
          Welcome to <span className="text-gradient">Madifa</span>
        </h1>
        <p className="mb-8 text-xl text-gray-300">
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
