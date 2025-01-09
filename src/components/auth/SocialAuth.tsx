import { useAuth } from '@/providers'
import { useState } from 'react'
import { AuthButton } from './AuthComponents'

type Provider = 'google'

interface SocialAuthProps {
  className?: string
  onSuccess?: () => void
}

export function SocialAuth({ className = '', onSuccess }: SocialAuthProps) {
  const { signInWithProvider } = useAuth()
  const [isLoading, setIsLoading] = useState(false)

  const handleProviderSignIn = async (provider: Provider) => {
    setIsLoading(true)
    try {
      await signInWithProvider(provider)
      onSuccess?.()
    } catch (error) {
      console.error(`Error signing in with ${provider}:`, error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <AuthButton
        onClick={() => handleProviderSignIn('google')}
        disabled={isLoading}
        variant="outline"
        className="w-full bg-white text-gray-900 hover:bg-gray-50"
      >
        Continue with Google
      </AuthButton>
    </div>
  )
}
