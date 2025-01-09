import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { useAuth } from '@/providers/AuthProvider'
import type { Permission } from '@/types'
import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'

interface PermissionGuardProps {
  children: React.ReactNode
  requiredPermissions?: Permission[]
  requireAll?: boolean // If true, user must have all permissions. If false, any one is sufficient
}

export function PermissionGuard({
  children,
  requiredPermissions = [],
  requireAll = true,
}: PermissionGuardProps) {
  const { user, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />
  }

  // Admin role bypasses permission checks
  if (user.role === 'admin') {
    return <>{children}</>
  }

  // If no specific permissions are required, allow access
  if (requiredPermissions.length === 0) {
    return <>{children}</>
  }

  const userPermissions = user.user_metadata.permissions || []

  const hasPermission = requireAll
    ? requiredPermissions.every(required =>
        userPermissions.some(
          (userPerm: Permission) =>
            userPerm.resource === required.resource &&
            userPerm.action === required.action
        )
      )
    : requiredPermissions.some(required =>
        userPermissions.some(
          (userPerm: Permission) =>
            userPerm.resource === required.resource &&
            userPerm.action === required.action
        )
      )

  if (!hasPermission) {
    return <Navigate to="/unauthorized" replace />
  }

  return <>{children}</>
}
