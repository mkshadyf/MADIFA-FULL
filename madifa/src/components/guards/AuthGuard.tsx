import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import type { UserRole } from '@/types/auth'

interface AuthGuardProps {
  children: React.ReactNode
  requiredRole?: UserRole
}

export default function AuthGuard({ children, requiredRole }: AuthGuardProps) {
  const { user, userProfile, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  if (!user) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />
  }

  if (requiredRole && userProfile?.role !== requiredRole) {
    return <Navigate to="/unauthorized" replace />
  }

  return <>{children}</>
} 