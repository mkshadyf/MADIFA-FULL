import { lazy } from 'react'
import type { RouteObject } from 'react-router-dom'

const SignIn = lazy(() => import('@/pages/auth/signin'))
const SignUp = lazy(() => import('@/pages/auth/signup'))
const ResetPassword = lazy(() => import('@/pages/auth/reset-password'))
const AuthCallback = lazy(() => import('@/pages/auth/callback'))

export const authRoutes: RouteObject[] = [
  {
    path: 'signin',
    element: <SignIn />
  },
  {
    path: 'signup',
    element: <SignUp />
  },
  {
    path: 'reset-password',
    element: <ResetPassword />
  },
  {
    path: 'callback',
    element: <AuthCallback />
  }
] 