import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { useAuth } from '@/hooks/useAuth'
import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

export default function AuthCallbackPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { handleAuthCallback } = useAuth()

  useEffect(() => {
    const code = searchParams.get('code')
    if (code) {
      handleAuthCallback(code)
        .then(() => {
          const redirectTo = searchParams.get('redirectTo') || '/'
          navigate(redirectTo, { replace: true })
        })
        .catch(error => {
          console.error('Auth callback error:', error)
          navigate('/auth/signin', { replace: true })
        })
    } else {
      navigate('/auth/signin', { replace: true })
    }
  }, [searchParams, navigate, handleAuthCallback])

  return (
    <div className="flex min-h-screen items-center justify-center">
      <LoadingSpinner />
    </div>
  )
}
