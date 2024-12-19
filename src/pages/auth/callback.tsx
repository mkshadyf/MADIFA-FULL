import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

import { useToast } from '@/hooks/useToast'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'

export default function AuthCallback () {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { showToast } = useToast()

  useEffect(() => {
    error')
    error_description')

    if (error) {
      showToast(errorDescription || 'Authentication failed', 'error')
      navigate('/auth/signin')
      return
    }

    // Handle successful auth
    showToast('Successfully authenticated', 'success')
    navigate('/onboarding')
  }, [navigate, searchParams, showToast])

  return <LoadingState text="Completing authentication..." />
}
