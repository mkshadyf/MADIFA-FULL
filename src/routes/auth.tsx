import { lazy } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { AuthGuard } from '@/components/guards/AuthGuard'

const LoginPage = lazy(() => import('@/pages/auth/signin/page'))
const SignupPage = lazy(() => import('@/pages/auth/signup/page'))
const ResetPasswordPage = lazy(() => import('@/pages/auth/reset-password/page'))
const UpdatePasswordPage = lazy(
  () => import('@/pages/auth/update-password/page')
)
const VerifyEmailPage = lazy(() => import('@/pages/auth/verify-email/page'))
const AuthCallbackPage = lazy(() => import('@/pages/auth/callback'))

export const AuthRoutes = () => {
  return (
    <Routes>
      <Route path="signin" element={<LoginPage />} />
      <Route path="signup" element={<SignupPage />} />
      <Route path="reset-password" element={<ResetPasswordPage />} />
      <Route path="update-password" element={<UpdatePasswordPage />} />
      <Route path="verify-email" element={<VerifyEmailPage />} />
      <Route path="callback" element={<AuthCallbackPage />} />
      <Route path="*" element={<Navigate to="/auth/signin" replace />} />
    </Routes>
  )
}

export const ProtectedRoutes = () => {
  return (
    <AuthGuard allowedRoles={['user', 'admin']}>
      <Routes>{/* Protected routes go here */}</Routes>
    </AuthGuard>
  )
}
