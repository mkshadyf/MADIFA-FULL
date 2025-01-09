import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { supabase } from '@/lib/supabase/client'
import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

export default function AuthCallbackPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const code = searchParams.get('code')
        if (!code) {
          navigate('/auth/signin', { replace: true })
          return
        }

        const { error } = await supabase.auth.exchangeCodeForSession(code)
        if (error) throw error

        const redirectTo = searchParams.get('redirectTo') || '/'
        navigate(redirectTo, { replace: true })
      } catch (error) {
        console.error('Auth callback error:', error)
        navigate('/auth/signin', { replace: true })
      }
    }

    void handleCallback()
  }, [searchParams, navigate])

  return (
    <div className="flex min-h-screen items-center justify-center">
      <LoadingSpinner />
    </div>
  )
}
