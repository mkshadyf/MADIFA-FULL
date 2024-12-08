import { lazy, Suspense } from 'react'
import { createBrowserRouter, Navigate } from 'react-router-dom'
import Loading from '@/components/ui/loading'
import AuthGuard from '@/components/guards/AuthGuard'
import type { UserRole } from '@/types/auth'

// Lazy load components with prefetching
const Layout = lazy(() => import(/* webpackPrefetch: true */ '@/components/layout'))
const Login = lazy(() => import(/* webpackPrefetch: true */ '@/pages/auth/login'))
const Register = lazy(() => import(/* webpackPrefetch: true */ '@/pages/auth/register'))

// Admin routes
const VimeoPage = lazy(() => import('@/pages/admin/vimeo'))
const AnalyticsPage = lazy(() => import('@/pages/admin/analytics'))
const PerformanceDashboard = lazy(() => import('@/components/admin/PerformanceDashboard'))

// User routes
const Dashboard = lazy(() => import('@/pages/dashboard'))
const Profile = lazy(() => import('@/pages/profile'))
const Settings = lazy(() => import('@/pages/settings'))
const Watch = lazy(() => import('@/pages/watch/[id]'))

// Error pages
const NotFound = lazy(() => import('@/pages/not-found'))

// Wrap lazy components with Suspense and loading indicator
const withSuspense = (Component: React.ComponentType, loadingMessage = 'Loading...') => (
  <Suspense
    fallback={
      <Loading message={loadingMessage} fullScreen />
    }
  >
    <Component />
  </Suspense>
)

// Protected route wrapper with role-based access
const withAuth = (Component: React.ComponentType, requiredRole?: UserRole) => (
  <AuthGuard requiredRole={requiredRole}>
    {withSuspense(Component)}
  </AuthGuard>
)

// Route configuration with code splitting
export const router = createBrowserRouter([
  {
    path: '/',
    element: withSuspense(Layout),
    children: [
      {
        index: true,
        element: <Navigate to="/dashboard" replace />,
      },
      {
        path: 'dashboard',
        element: withAuth(Dashboard),
      },
      {
        path: 'profile',
        element: withAuth(Profile),
      },
      {
        path: 'settings',
        element: withAuth(Settings),
      },
      {
        path: 'watch/:id',
        element: withAuth(Watch),
      },
      {
        path: 'admin',
        children: [
          {
            path: 'vimeo',
            element: withAuth(VimeoPage, 'admin'),
          },
          {
            path: 'analytics',
            element: withAuth(AnalyticsPage, 'admin'),
          },
          {
            path: 'performance',
            element: withAuth(PerformanceDashboard, 'admin'),
          }
        ]
      }
    ],
  },
  {
    path: '/auth',
    children: [
      {
        path: 'login',
        element: withSuspense(Login),
      },
      {
        path: 'register',
        element: withSuspense(Register),
      },
    ],
  },
  {
    path: '*',
    element: withSuspense(NotFound),
  },
])

export default router 
