import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/providers/AuthProvider'

export default function AuthCallback() {
  const navigate = useNavigate()
  const { user } = useAuth()

  useEffect(() => {
    if (user) {
      navigate('/browse')
    }
  }, [user, navigate])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-white">Completing sign in...</h2>
        <p className="mt-2 text-gray-400">Please wait while we redirect you.</p>
      </div>
    </div>
  )
} 