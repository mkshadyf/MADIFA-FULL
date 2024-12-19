import { Suspense, lazy } from 'react'
import SignInPage from '@/pages/auth/signin/page'
import SignUpPage from '@/pages/auth/signup/page'
import { Navigate, Route, Routes } from 'react-router-dom'

import { useAuth } from '@/hooks/useAuth'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { AuthGuard } from '@/components/guards/AuthGuard'
import { MainLayout } from '@/components/layouts'

// Lazy loaded components with proper types
const HomePage = lazy(async () => {
  const module = await import('@/pages/home/index')
  return { default: module.default }
})

const ProfilePage = lazy(async () => {
  const module = await import('@/pages/profile/index')
  return { default: module.default }
})

const AdminDashboard = lazy(async () => {
  const module = await import('@/pages/admin/dashboard/page')
  return { default: module.default }
})

export function AppRoutes(): JSX.Element {
  const { isLoading } = useAuth()

  if (isLoading) {
    return <LoadingSpinner size="lg" />
  }

  return (
    <Routes>
      <Route element={<MainLayout />}>
        {/* Public routes */}
        <Route path="/auth/signin" element={<SignInPage />} />
        <Route path="/auth/signup" element={<SignUpPage />} />

        {/* Protected routes */}
        <Route element={<AuthGuard allowedRoles={['user', 'admin']} />}>
          <Route
            path="/"
            element={
              <Suspense fallback={<LoadingSpinner size="lg" />}>
                <HomePage />
              </Suspense>
            }
          />
          <Route
            path="/profile"
            element={
              <Suspense fallback={<LoadingSpinner size="lg" />}>
                <ProfilePage />
              </Suspense>
            }
          />
        </Route>

        {/* Admin routes */}
        <Route element={<AuthGuard allowedRoles={['admin']} />}>
          <Route
            path="/admin"
            element={
              <Suspense fallback={<LoadingSpinner size="lg" />}>
                <AdminDashboard />
              </Suspense>
            }
          />
        </Route>

        {/* Fallback route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}
