import React from 'react'
import { useAuth } from '@/hooks/useAuth'
import {
  createErrorContext,
  ErrorCodes,
  handleError,
  throwAppError,
} from '@/lib/utils/error-handler'
import { hasRequiredPermissions } from '@/types/auth'
import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import type { UserRole } from '@/types/auth'
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
            ErrorCodes.AUTH.NOT_AUTHENTICATED,
            'RoleGuard.checkPermissions'
          )
        }

        if (!hasRequiredPermissions(profile, requiredRole)) {
          throwAppError(
            `Insufficient permissions: required role '${requiredRole}'`,
            ErrorCodes.AUTH.INSUFFICIENT_PERMISSIONS,
            'RoleGuard.checkPermissions'
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

  // Don't render anything while checking permissions
  if (loading) {
    return null
  }

  // Only render children if user has required permissions
  if (hasRequiredPermissions(profile, requiredRole)) {
    return <>{children}</>
  }

  return null
}
