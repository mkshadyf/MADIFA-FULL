import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useAuth } from '@/hooks/useAuth';
import type { UserRole } from '@/types/auth';
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface AuthGuardProps {
  children: React.ReactNode
  requireAuth?: boolean
  allowedRoles?: UserRole[]
  redirectTo?: string
}

export const AuthGuard = ({
  children,
  requireAuth = true,
  allowedRoles = [],
  redirectTo = '/auth/signin',
}: AuthGuardProps) => {
  const { isAuthenticated, isLoading, user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!isLoading) {
      if (requireAuth && !isAuthenticated) {
        navigate(redirectTo, { replace: true })
        return
      }

      if (allowedRoles.length > 0 && user?.profile?.role) {
        const hasPermission = allowedRoles.includes(
          user.profile.role as UserRole
        )
        if (!hasPermission) {
          navigate('/unauthorized', { replace: true })
        }
      }
    }
  }, [
    isAuthenticated,
    isLoading,
    navigate,
    redirectTo,
    requireAuth,
    allowedRoles,
    user,
  ])

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  return <>{children}</>
}
