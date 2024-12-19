import { Navigate, Outlet, useLocation } from 'react-router-dom'

import type { UserProfile, UserRole } from '@/types/auth'
import { hasRequiredPermissions } from '@/types/auth'
import { useAuth } from '@/hooks/useAuth'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'

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
  const { userProfile, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return <>{loadingComponent}</>
  }

  if (!userProfile) {
    return (
      <Navigate to={redirectPath} state={{ from: location.pathname }} replace />
    )
  }

  const hasPermission = checkUserPermissions(userProfile, allowedRoles)
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
