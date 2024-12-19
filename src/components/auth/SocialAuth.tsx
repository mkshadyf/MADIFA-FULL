import type { JSX } from 'react'
import { createErrorContext, handleError } from '@/utils/error-handler'

import { socialAuth } from '@/lib/services/social-auth'
import { cn } from '@/lib/utils'

interface SocialAuthProps {
  onSuccess?: () => void
  onError?: (error: Error) => void
  className?: string
}

type ProviderId = 'google' | 'apple' | 'facebook' | 'twitter'

interface SocialProvider {
  id: ProviderId
  name: string
  icon: string
  color: string
}

const providers: readonly SocialProvider[] = [
  {
    id: 'google',
    name: 'Google',
    icon: 'google',
    color: 'bg-white hover:bg-gray-50 text-gray-900 border border-gray-300',
  },
  {
    id: 'apple',
    name: 'Apple',
    icon: 'apple',
    color: 'bg-black hover:bg-gray-900 text-white',
  },
  {
    id: 'facebook',
    name: 'Facebook',
    icon: 'facebook',
    color: 'bg-[#1877F2] hover:bg-[#1874E8] text-white',
  },
  {
    id: 'twitter',
    name: 'Twitter',
    icon: 'twitter',
    color: 'bg-[#1DA1F2] hover:bg-[#1A97E4] text-white',
  },
] as const

export function SocialAuth({
  onSuccess,
  onError,
  className,
}: SocialAuthProps): JSX.Element {
  const context = createErrorContext(
    'SocialAuth',
    'handleSocialAuth',
    'authenticating with social provider'
  )

  const handleSocialAuth = async (providerId: ProviderId): Promise<void> => {
    try {
      switch (providerId) {
        case 'google':
          await socialAuth.google()
          break
        case 'apple':
          await socialAuth.apple()
          break
        case 'facebook':
          await socialAuth.facebook()
          break
        case 'twitter':
          await socialAuth.twitter()
          break
      }
      onSuccess?.()
    } catch (error) {
      handleError(error, context)
      onError?.(
        error instanceof Error ? error : new Error('Authentication failed')
      )
    }
  }

  return (
    <div className={cn('space-y-3', className)}>
      {providers.map(provider => (
        <button
          key={provider.id}
          onClick={() => void handleSocialAuth(provider.id)}
          className={cn(
            'flex w-full items-center justify-center gap-3 rounded-lg px-4 py-2 text-sm font-medium transition-colors',
            provider.color
          )}
        >
          <span
            className={`icon-${provider.icon} text-xl`}
            aria-hidden="true"
          />
          Continue with {provider.name}
        </button>
      ))}

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-gray-300" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="bg-white px-2 text-gray-500">
            Or continue with email
          </span>
        </div>
      </div>
    </div>
  )
}
