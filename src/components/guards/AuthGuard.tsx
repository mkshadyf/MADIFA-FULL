import React from "react"
import { Navigate, Outlet, useLocation } from 'react-router-dom'

import type { UserProfile } from '@/types/auth'
import { useAuth } from '@/hooks/useAuth'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'

export type UserRole = 'admin' | 'user' | 'guest'

export function hasRequiredPermissions(
  userProfile: UserProfile,
  requiredRole: UserRole
): boolean {
  const roleHierarchy: Record<UserRole, number> = {
    admin: 3,
    user: 2, 
    guest: 1
  }

  const userRoleLevel = roleHierarchy[userProfile.role as UserRole] || 0
  const requiredRoleLevel = roleHierarchy[requiredRole]

  return userRoleLevel >= requiredRoleLevel
}

interface AuthGuardProps {
  allowedRoles: readonly UserRole[]
  redirectPath?: string
  loadingComponent?: React.ReactNode
}

export function AuthGuard({
  allowedRoles,
  redirectPath = '/auth/signin',
  loadingComponent = <LoadingSpinner size="lg" className="mx-auto mt-8" />,
}: AuthGuardProps): JSX.Element {
  const { user: userProfile, loading: isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return <>{loadingComponent}</>
  }

  if (!userProfile) {
    return (
      <Navigate to={redirectPath} state={{ from: location.pathname }} replace />
    )
  }

  const hasPermission = checkUserPermissions(userProfile as UserProfile, allowedRoles)
  if (!hasPermission) {
    return <Navigate to="/unauthorized" replace />
  }

  return <Outlet />
}

function checkUserPermissions(
  userProfile: UserProfile,
  allowedRoles: readonly UserRole[]
): boolean {
  return allowedRoles.some(role => hasRequiredPermissions(userProfile, role))
}
