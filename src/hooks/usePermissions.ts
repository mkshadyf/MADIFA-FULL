import type { Permission } from '@/types/auth'
import { useAuth } from '@/components/providers/AuthProvider'

interface UsePermissionsReturn {
  hasPermission: (
    required: Permission | Permission[],
    requireAll?: boolean
  ) => boolean
  hasRole: (role: string | string[]) => boolean
  isAdmin: boolean
  isModerator: boolean
  isContentManager: boolean
}

export function usePermissions(): UsePermissionsReturn {
  const { userProfile } = useAuth()

  const hasPermission = (
    required: Permission | Permission[],
    requireAll = true
  ): boolean => {
    if (!userProfile) return false

    // Admin role bypasses permission checks
    if (userProfile.role === 'admin') return true

    const userPermissions = userProfile.permissions || []
    const requiredPermissions = Array.isArray(required) ? required : [required]

    return requireAll
      ? requiredPermissions.every(required =>
          userPermissions.some(
            userPerm =>
              userPerm.resource === required.resource &&
              userPerm.action === required.action
          )
        )
      : requiredPermissions.some(required =>
          userPermissions.some(
            userPerm =>
              userPerm.resource === required.resource &&
              userPerm.action === required.action
          )
        )
  }

  const hasRole = (role: string | string[]): boolean => {
    if (!userProfile) return false
    const roles = Array.isArray(role) ? role : [role]
    return roles.includes(userProfile.role)
  }

  const isAdmin = userProfile?.role === 'admin'
  const isModerator = userProfile?.role === 'moderator'
  const isContentManager = userProfile?.role === 'content_manager'

  return {
    hasPermission,
    hasRole,
    isAdmin,
    isModerator,
    isContentManager,
  }
}
