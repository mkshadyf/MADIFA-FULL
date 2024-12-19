import { useContext } from 'react'

import type { AuthContextValue } from '@/components/providers/AuthProvider'
import { AuthContext } from '@/components/providers/AuthProvider'

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
