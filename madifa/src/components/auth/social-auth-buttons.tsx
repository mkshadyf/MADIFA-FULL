

import { useState } from 'react'
import Image from 'react-router-dom'
import { socialAuth } from '@/lib/services/social-auth'

interface SocialAuthButtonsProps {
  onError?: (error: Error) => void
}

export default function SocialAuthButtons({ onError }: SocialAuthButtonsProps) {
  const [loading, setLoading] = useState<string | null>(null)

  const handleSocialAuth = async (provider: string) => {
    setLoading(provider)
    try {
      switch (provider) {
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
        default:
          throw new Error('Unsupported provider')
      }
    } catch (error) {
      console.error('Social auth error:', error)
      if (error instanceof Error && onError) {
        onError(error)
      }
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-700" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-black/30 text-gray-400">
            Or continue with
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => handleSocialAuth('google')}
          disabled={!!loading}
          className="flex justify-center items-center px-4 py-2.5 rounded-lg
                   bg-black/30 border border-gray-600 text-gray-300
                   hover:bg-black/50 hover:border-gray-500
                   disabled:opacity-50 disabled:cursor-not-allowed
                   transition-colors duration-200"
        >
          {loading === 'google' ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <Image
                src="/icons/google.svg"
                alt="Google"
                width={20}
                height={20}
                className="mr-2"
              />
              Google
            </>
          )}
        </button>

        <button
          type="button"
          onClick={() => handleSocialAuth('apple')}
          disabled={!!loading}
          className="flex justify-center items-center px-4 py-2.5 rounded-lg
                   bg-black/30 border border-gray-600 text-gray-300
                   hover:bg-black/50 hover:border-gray-500
                   disabled:opacity-50 disabled:cursor-not-allowed
                   transition-colors duration-200"
        >
          {loading === 'apple' ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <Image
                src="/icons/apple.svg"
                alt="Apple"
                width={20}
                height={20}
                className="mr-2"
              />
              Apple
            </>
          )}
        </button>
      </div>
    </div>
  )
} 
