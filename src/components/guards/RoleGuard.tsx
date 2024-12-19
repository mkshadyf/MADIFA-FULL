import { useEffect } from 'react'
import {
  createErrorContext,
  ErrorCodes,
  handleError,
  throwAppError,
} from '@/utils/error-handler'
import { useLocation, useNavigate } from 'react-router-dom'

import type { UserRole } from '@/types/auth'
import { hasRequiredPermissions } from '@/types/auth'
import { useAuth } from '@/hooks/useAuth'

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
  const { userProfile, isLoading } = useAuth()

  useEffect(() => {
    const context = createErrorContext(
      'RoleGuard',
      'checkPermissions',
      `checking ${requiredRole} role permissions`
    )

    try {
      if (!isLoading) {
        if (!userProfile) {
          throwAppError(
            'User profile not found',
            ErrorCodes.AUTH.NOT_AUTHENTICATED,
            'RoleGuard.checkPermissions'
          )
        }

        if (!hasRequiredPermissions(userProfile, requiredRole)) {
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
  }, [userProfile, requiredRole, fallbackPath, isLoading, navigate, location])

  // Don't render anything while checking permissions
  if (isLoading) {
    return null
  }

  // Only render children if user has required permissions
  if (hasRequiredPermissions(userProfile, requiredRole)) {
    return <>{children}</>
  }

  return null
}
