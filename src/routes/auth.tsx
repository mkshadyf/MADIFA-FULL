import React from "react"
import { lazy, Suspense, type ComponentType, type FC } from 'react'
import type { RouteObject } from 'react-router-dom'

import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { AuthLayout } from '@/components/layouts'

// Lazy loaded components with proper types
const SignInPage = lazy(async () => {
  const module = await import('@/pages/auth/signin/page')
  return { default: module.default }
})

const SignUpPage = lazy(async () => {
  const module = await import('@/pages/auth/signup/page')
  return { default: module.default }
})

const ResetPasswordPage = lazy(async () => {
  const module = await import('@/pages/auth/reset-password/page')
  return { default: module.default }
})

const VerifyEmailPage = lazy(async () => {
  const module = await import('@/pages/auth/verify-email/page')
  return { default: module.default }
})

const UpdatePasswordPage = lazy(async () => {
  const module = await import('@/pages/auth/update-password/page')
  return { default: module.default }
})

function withErrorBoundary<P extends object>(
  Component: ComponentType<P>
): FC<P> {
  const WrappedComponent: FC<P> = props => {
    return (
      <ErrorBoundary>
        <Suspense fallback={<LoadingSpinner className="mx-auto mt-8" />}>
          <Component {...props} />
        </Suspense>
      </ErrorBoundary>
    )
  }

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name || 'Component'})`
  return WrappedComponent
}

const routes = [
  {
    path: 'signin',
    Component: SignInPage,
  },
  {
    path: 'signup',
    Component: SignUpPage,
  },
  {
    path: 'reset-password',
    Component: ResetPasswordPage,
  },
  {
    path: 'verify-email',
    Component: VerifyEmailPage,
  },
  {
    path: 'update-password',
    Component: UpdatePasswordPage,
  },
] as const

export const authRoutes: RouteObject[] = [
  {
    element: <AuthLayout />,
    children: routes.map(({ path, Component }) => ({
      path,
      element: <Component />,
    })),
  },
]
