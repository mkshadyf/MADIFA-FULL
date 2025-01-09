import { Navigate, Route, Routes, useParams } from 'react-router-dom'

import { ErrorBoundary } from '@/components/error-boundary'
import { AuthGuard } from '@/components/guards/AuthGuard'
import { MainLayout } from '@/components/layouts'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { useAuth } from '@/hooks/useAuth'
import React from 'react'

// Auth pages (not lazy loaded for faster initial auth)
import SignInPage from '@/pages/auth/signin/page'
import SignUpPage from '@/pages/auth/signup/page'

// Lazy loaded pages
const AdminDashboard = React.lazy(() => import('@/pages/admin/dashboard/page'))
const BrowsePage = React.lazy(() => import('@/pages/main/browse/page'))
const CategoryPage = React.lazy(
  () => import('@/pages/main/category/[slug]/page')
)
const ProfilePage = React.lazy(() => import('@/pages/main/profile/page'))
const SubscriptionPage = React.lazy(
  () => import('@/pages/main/subscription/page')
)
const WatchPage = React.lazy(() => import('@/pages/main/watch/[id]/page'))

// Wrapper component to pass params to CategoryPage
function CategoryPageWrapper() {
  const params = useParams<{ slug: string }>()
  if (!params.slug) {
    return <Navigate to="/browse" replace />
  }
  return <CategoryPage params={{ slug: params.slug }} />
}

export function AppRoutes() {
  const { isLoading, isAuthenticated } = useAuth()

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <ErrorBoundary>
      <Routes>
        {/* Public routes */}
        <Route
          path="/auth/signin"
          element={
            !isAuthenticated ? <SignInPage /> : <Navigate to="/" replace />
          }
        />
        <Route
          path="/auth/signup"
          element={
            !isAuthenticated ? <SignUpPage /> : <Navigate to="/" replace />
          }
        />

        {/* Protected routes */}
        <Route
          element={
            <AuthGuard allowedRoles={['user', 'admin']}>
              <MainLayout />
            </AuthGuard>
          }
        >
          <Route path="/" element={<Navigate to="/browse" replace />} />
          <Route path="/browse" element={<BrowsePage />} />
          <Route path="/category/:slug" element={<CategoryPageWrapper />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/subscription" element={<SubscriptionPage />} />
          <Route path="/watch/:id" element={<WatchPage />} />
        </Route>

        {/* Admin routes */}
        <Route
          element={
            <AuthGuard allowedRoles={['admin']}>
              <MainLayout />
            </AuthGuard>
          }
        >
          <Route
            path="/admin"
            element={<Navigate to="/admin/dashboard" replace />}
          />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
        </Route>

        {/* Fallback route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </ErrorBoundary>
  )
}

export default AppRoutes
