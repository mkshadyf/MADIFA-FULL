import React from 'react'
import { useAuth } from '@/providers/AuthProvider'
import { Navigate, useLocation } from 'react-router-dom'

import type { Permission } from '@/types/auth'

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
  const { userProfile, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        Loading...
      </div>
    )
  }

  if (!userProfile) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />
  }

  // Admin role bypasses permission checks
  if (userProfile.role === 'admin') {
    return <>{children}</>
  }

  // If no specific permissions are required, allow access
  if (requiredPermissions.length === 0) {
    return <>{children}</>
  }

  const userPermissions = userProfile.permissions || []

  const hasPermission = requireAll
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

  if (!hasPermission) {
    return <Navigate to="/unauthorized" replace />
  }

  return <>{children}</>
}
