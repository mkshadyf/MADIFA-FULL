import { AuthContext } from '@/contexts/auth'
import type { AuthContextValue } from '@/types/auth'
import { useContext } from 'react'

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
