import { lazy, Suspense } from 'react'
import { createBrowserRouter, Navigate } from 'react-router-dom'
import Loading from '@/components/ui/loading'
import AuthGuard from '@/components/guards/AuthGuard'

// Lazy load components
const Layout = lazy(() => import('@/components/layout'))
const Login = lazy(() => import('@/pages/auth/login'))
const Register = lazy(() => import('@/pages/auth/register'))
const Dashboard = lazy(() => import('@/pages/dashboard'))
const Profile = lazy(() => import('@/pages/profile'))
const Settings = lazy(() => import('@/pages/settings'))
const NotFound = lazy(() => import('@/pages/not-found'))

// Wrap lazy components with Suspense
const withSuspense = (Component: React.ComponentType) => (
  <Suspense
    fallback={
      <Loading message="Loading page..." fullScreen />
    }
  >
    <Component />
  </Suspense>
)

// Protected route wrapper
const withAuth = (Component: React.ComponentType, requiredRole?: string) => (
  <AuthGuard requiredRole={requiredRole}>
    {withSuspense(Component)}
  </AuthGuard>
)

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
