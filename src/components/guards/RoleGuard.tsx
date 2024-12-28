import React from 'react'
import { useAuth } from '@/hooks/useAuth'
import {
  createErrorContext,
  ErrorCodes,
  handleError,
  throwAppError,
} from '@/lib/utils/error-handler'
import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import type { UserProfile, UserRole, Permission } from '@/types/user'

const hasRequiredPermissions = (permissions: Permission[], role: UserRole): boolean => {
  // Implement your permission checking logic here
  return permissions.some(permission => permission.scope === 'role' && permission.action === '*');
};

interface RoleGuardProps {
  children: React.ReactNode
  requiredRole: UserRole
  fallbackPath?: string
}

export function RoleGuard({
  children,
  requiredRole,
  fallbackPath = '/unauthorized',
}: RoleGuardProps): JSX.Element | null {
  const navigate = useNavigate()
  const location = useLocation()
  const { profile, loading } = useAuth()

  useEffect(() => {
    const context = createErrorContext(
      'RoleGuard',
      'checkPermissions',
      `checking ${requiredRole} role permissions`
    )

    try {
      if (!loading) {
        if (!profile) {
          throwAppError(
            'User profile not found',
            ErrorCodes.UNAUTHORIZED,
            { operation: 'RoleGuard.checkPermissions' }
          )
        }

        if (profile && !hasRequiredPermissions(profile.permissions, requiredRole)) {
          throwAppError(
            `Insufficient permissions: required role '${requiredRole}'`,
            ErrorCodes.FORBIDDEN,
            { operation: 'RoleGuard.checkPermissions' }
          )
        }
      }
    } catch (error) {
      handleError(error, context)
      navigate(fallbackPath, {
        state: {
          from: location.pathname,
          error: error instanceof Error ? error.message : 'Access denied',
        },
        replace: true,
      })
    }
  }, [profile, requiredRole, fallbackPath, loading, navigate, location])

  if (loading) {
    return null
  }

  if (profile && hasRequiredPermissions(profile.permissions, requiredRole)) {
    return <>{children}</>
  }

  return null
}
