import { Suspense, lazy } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'

import { useAuth } from '@/hooks/useAuth'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { AuthGuard } from '@/components/guards/AuthGuard'
import { MainLayout } from '@/components/layouts'
import { ErrorBoundary } from '@/components/ErrorBoundary'

// Auth pages (not lazy loaded for faster initial auth)
import SignInPage from '@/pages/auth/signin/page'
import SignUpPage from '@/pages/auth/signup/page'

// Lazy loaded pages
const HomePage = lazy(() => import('@/pages/home/index'))
const ProfilePage = lazy(() => import('@/pages/profile/index'))
const AdminDashboard = lazy(() => import('@/pages/admin/dashboard/page'))

// Loading component with error boundary
const PageLoader = ({ children }: { children: React.ReactNode }) => (
  <ErrorBoundary>
    <Suspense fallback={<LoadingSpinner size="lg" className="mx-auto mt-8" />}>
      {children}
    </Suspense>
  </ErrorBoundary>
)

export function AppRoutes(): JSX.Element {
  const { loading } = useAuth()

  if (loading) {
    return <LoadingSpinner size="lg" className="mx-auto mt-8" />
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
              <PageLoader>
                <HomePage />
              </PageLoader>
            }
          />
          <Route
            path="/profile"
            element={
              <PageLoader>
                <ProfilePage />
              </PageLoader>
            }
          />
        </Route>

        {/* Admin routes */}
        <Route element={<AuthGuard allowedRoles={['admin']} />}>
          <Route
            path="/admin"
            element={
              <PageLoader>
                <AdminDashboard />
              </PageLoader>
            }
          />
        </Route>

        {/* Catch-all route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}

export default AppRoutes
