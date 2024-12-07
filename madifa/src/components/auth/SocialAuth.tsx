import { useState } from 'react'
import { Provider } from '@supabase/supabase-js'
import { authService } from '@/lib/services/auth'
import { socialProviders } from '@/lib/config/auth'
import { useToast } from '@/hooks/useToast'
import { Button } from '@/components/ui/Button'

interface SocialAuthProps {
  onSuccess?: () => void
  onError?: (error: Error) => void
}

export default function SocialAuth({ onSuccess, onError }: SocialAuthProps) {
  const [isLoading, setIsLoading] = useState<Provider | null>(null)
  const { showToast } = useToast()

  const handleSocialLogin = async (provider: Provider) => {
    try {
      setIsLoading(provider)
      await authService.signInWithProvider(provider)
      onSuccess?.()
    } catch (error) {
      console.error('Social auth error:', error)
      showToast('Failed to authenticate with provider', 'error')
      onError?.(error as Error)
    } finally {
      setIsLoading(null)
    }
  }

  return (
    <div className="space-y-3">
      {(Object.entries(socialProviders) as [Provider, typeof socialProviders[keyof typeof socialProviders]][]).map(
        ([provider, config]) => (
          <Button
            key={provider}
            onClick={() => handleSocialLogin(provider)}
            isLoading={isLoading === provider}
            className={`w-full ${config.color}`}
          >
            <span className="flex items-center justify-center">
              <SocialIcon icon={config.icon} className="w-5 h-5 mr-2" />
              Continue with {config.name}
            </span>
          </Button>
        )
      )}
    </div>
  )
}

function SocialIcon({ icon, className }: { icon: string; className?: string }) {
  switch (icon) {
    case 'google':
      return (
        <svg className={className} viewBox="0 0 24 24">
          <path
            fill="currentColor"
            d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"
          />
        </svg>
      )
    case 'facebook':
      return (
        <svg className={className} viewBox="0 0 24 24">
          <path
            fill="currentColor"
            d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"
          />
        </svg>
      )
    case 'apple':
      return (
        <svg className={className} viewBox="0 0 24 24">
          <path
            fill="currentColor"
            d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.53 4.08M13 7.13C12.8 5.24 14.34 3.72 16 3c.39 1.91-1.21 3.58-3 4.13Z"
          />
        </svg>
      )
    default:
      return null
  }
} 