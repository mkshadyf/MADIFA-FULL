import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useAuth } from '@/hooks/useAuth';
import { createErrorContext, handleApiError } from '@/lib/utils/error-handler';
import type { Permission, UserRole } from '@/types/auth';
import React, { useEffect } from 'react';

interface RoleGuardProps {
  children: React.ReactNode
  requiredRole: UserRole
  requiredPermissions?: Permission[]
}

export function RoleGuard({
  children,
  requiredRole,
  requiredPermissions = [],
}: RoleGuardProps): JSX.Element | null {
  const { profile, isLoading, isAuthenticated } = useAuth()

  const hasRequiredRole = profile?.role === requiredRole
  const hasRequiredPermissions = requiredPermissions.every(permission =>
    profile?.permissions?.includes(permission)
  )

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      const error = handleApiError(
        new Error('Authentication required'),
        createErrorContext('auth', 'role-guard')
      )
      throw error
    }

    if (!isLoading && !hasRequiredRole) {
      const error = handleApiError(
        new Error(`Insufficient role: ${requiredRole} required`),
        createErrorContext('auth', 'role-guard')
      )
      throw error
    }

    if (!isLoading && !hasRequiredPermissions) {
      const error = handleApiError(
        new Error('Insufficient permissions'),
        createErrorContext('auth', 'role-guard')
      )
      throw error
    }
  }, [
    isLoading,
    isAuthenticated,
    hasRequiredRole,
    hasRequiredPermissions,
    requiredRole,
  ])

  if (isLoading) {
    return <LoadingSpinner />
  }

  return <>{children}</>
}
