import {
  AuthContext,
  type AuthContextValue,
} from '@/components/providers/AuthProvider'
import { useContext } from 'react'

export function useAuth(): AuthContextValue {
  const context = useContext<AuthContextValue | null>(AuthContext)

  if (context === null || context === undefined) {
    throw new Error(
      'AuthContext is not available - useAuth must be used within an AuthProvider'
    )
  }

  return context
}
