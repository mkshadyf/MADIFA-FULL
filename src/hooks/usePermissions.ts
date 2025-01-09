import { useAuth } from '@/providers/AuthProvider'
import type { Permission } from '@/types/auth'

interface UsePermissionsResult {
  hasPermission: (permission: Permission) => boolean
  permissions: Permission[]
  isAdmin: boolean
}

export function usePermissions(): UsePermissionsResult {
  const { profile } = useAuth()

  const hasPermission = (permission: Permission): boolean => {
    if (!profile) return false
    return profile.permissions?.includes(permission) || false
  }

  const isAdmin = profile?.role === 'admin'

  return {
    hasPermission,
    permissions: profile?.permissions || [],
    isAdmin,
  }
}
