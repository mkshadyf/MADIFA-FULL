import React from 'react'
import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import MainLayout from '@/components/layout/MainLayout'
import AdminLayout from '@/components/layout/AdminLayout'
import AuthLayout from '@/components/layout/AuthLayout'

// Lazy load pages for better performance
const HomePage = React.lazy(() => import('@/pages/home'))
const BrowsePage = React.lazy(() => import('@/pages/browse'))
const SearchPage = React.lazy(() => import('@/pages/search'))
const WatchPage = React.lazy(() => import('@/pages/watch/[id]'))
const ProfilePage = React.lazy(() => import('@/pages/profile'))
const FavoritesPage = React.lazy(() => import('@/pages/favorites'))
const SignInPage = React.lazy(() => import('@/pages/auth/signin'))
const SignUpPage = React.lazy(() => import('@/pages/auth/signup'))
const ResetPasswordPage = React.lazy(() => import('@/pages/auth/reset-password'))
const AdminDashboard = React.lazy(() => import('@/pages/admin/dashboard'))
const AdminVimeo = React.lazy(() => import('@/pages/admin/vimeo'))
const SubscriptionPage = React.lazy(() => import('@/pages/subscription'))

// Auth guard for protected routes
function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  
  if (loading) {
    return <div>Loading...</div>
  }
  
  if (!user) {
    return <Navigate to="/auth/signin" state={{ from: location.pathname }} />
  }

  return <>{children}</>
}

// Admin guard
function RequireAdmin({ children }: { children: React.ReactNode }) {
  const { user, profile, loading } = useAuth()
  
  if (loading) {
    return <div>Loading...</div>
  }
  
  if (!user || profile?.role !== 'admin') {
    return <Navigate to="/auth/signin" />
  }

  return <>{children}</>
}

// Subscription guard
function RequireSubscription({ children }: { children: React.ReactNode }) {
  const { profile } = useAuth()
  
  if (profile?.subscription_status !== 'active') {
    return <Navigate to="/subscription" />
  }

  return <>{children}</>
}

// Export the router instance as default
const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      { index: true, element: <HomePage /> },
      {
        element: <RequireAuth><Outlet /></RequireAuth>,
        children: [
          { path: 'browse', element: <BrowsePage /> },
          { path: 'search', element: <SearchPage /> },
          {
            path: 'watch/:id',
            element: (
              <RequireSubscription>
                <WatchPage />
              </RequireSubscription>
            )
          },
          { path: 'profile', element: <ProfilePage /> },
          { path: 'favorites', element: <FavoritesPage /> },
          { path: 'subscription', element: <SubscriptionPage /> }
        ]
      }
    ]
  },
  {
    path: '/admin',
    element: (
      <RequireAdmin>
        <AdminLayout />
      </RequireAdmin>
    ),
    children: [
      { index: true, element: <Navigate to="/admin/dashboard" replace /> },
      { path: 'dashboard', element: <AdminDashboard /> },
      { path: 'vimeo/*', element: <AdminVimeo /> }
    ]
  },
  {
    path: '/auth',
    element: <AuthLayout />,
    children: [
      { path: 'signin', element: <SignInPage /> },
      { path: 'signup', element: <SignUpPage /> },
      { path: 'reset-password', element: <ResetPasswordPage /> }
    ]
  },
  {
    path: '*',
    element: <Navigate to="/" replace />
  }
])

export default router 
