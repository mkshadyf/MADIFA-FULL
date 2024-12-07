import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useToast } from '@/hooks/useToast'
import LoadingState from '@/components/ui/loading-state'

export default function AuthCallback() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { showToast } = useToast()

  useEffect(() => {
    const error = searchParams.get('error')
    const errorDescription = searchParams.get('error_description')

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