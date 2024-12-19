import React from 'react'
import type { ReactElement } from 'react'
import { AuthProvider } from '@/providers/AuthProvider'
import type {
  AuthApiError,
  AuthError,
  AuthResponse,
  PostgrestError,
  Session,
  User,
} from '@supabase/supabase-js'
import { render } from '@testing-library/react'
import type { RenderOptions } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'

import type { UserProfile } from '@/types/auth'

interface TestWrapperProps {
  children: React.ReactNode
}

export function TestWrapper({ children }: TestWrapperProps): JSX.Element {
  return (
    <BrowserRouter>
      <AuthProvider>{children}</AuthProvider>
    </BrowserRouter>
  )
}

export function renderWithProviders(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
): ReturnType<typeof render> {
  return render(ui, { wrapper: TestWrapper, ...options })
}

// Mock Supabase Response Types
export interface SupabaseDataResponse<T> {
  data: T | null
  error: PostgrestError | null
}

interface SupabaseAuthResponse<T> {
  data: T | null
  error: AuthApiError | null
}

export function mockAuthError(error: Partial<AuthError>): AuthApiError {
  const authError = new Error() as AuthApiError
  Object.assign(authError, {
    name: error.name || 'AuthApiError',
    message: error.message || 'Auth error occurred',
    status: error.status || 400,
    code: 'auth/error',
  })
  return authError
}

export function mockPostgrestError(
  error: Partial<PostgrestError>
): PostgrestError {
  const postgrestError = new Error() as PostgrestError
  Object.assign(postgrestError, {
    name: error.name || 'PostgrestError',
    message: error.message || 'Database error occurred',
    details: error.details || '',
    hint: error.hint || '',
    code: error.code || 'ERROR',
  })
  return postgrestError
}

export function mockDataResponse<T>(
  data: T | null = null,
  error: Partial<PostgrestError> | null = null
): SupabaseDataResponse<T> {
  return {
    data,
    error: error ? mockPostgrestError(error) : null,
  }
}

export function mockAuthResponse<T>(
  data: T | null = null,
  error: Partial<AuthError> | null = null
): SupabaseAuthResponse<T> {
  return {
    data,
    error: error ? mockAuthError(error) : null,
  }
}

// Helper to create mock Supabase responses
export function createMockAuthResponse(
  user: User | null = null,
  session: Session | null = null,
  error: Error | null = null
): AuthResponse {
  if (error) {
    return {
      data: {
        user: null,
        session: null,
      },
      error: mockAuthError({
        name: error.name,
        message: error.message,
        status: 400,
      }),
    }
  }
  return {
    data: {
      user,
      session,
    },
    error: null,
  }
}

export function createMockDataResponse<T>(
  data: T | null = null,
  error: Error | null = null
): SupabaseDataResponse<T> {
  if (error) {
    return {
      data: null,
      error: mockPostgrestError({
        name: 'PostgrestError',
        code: 'PGRST301',
        message: error.message,
        details: error.stack ?? '',
        hint: '',
      }),
    }
  }
  return {
    data,
    error: null,
  }
}

// Helper to create mock user data
export function createMockUser(overrides: Partial<User> = {}): User {
  const now = new Date().toISOString()
  return {
    id: 'test-user-id',
    aud: 'authenticated',
    role: 'authenticated',
    email: 'test@example.com',
    email_confirmed_at: now,
    phone: '',
    confirmation_sent_at: now,
    confirmed_at: now,
    last_sign_in_at: now,
    app_metadata: {
      provider: 'email',
      providers: ['email'],
    },
    user_metadata: {},
    identities: [],
    created_at: now,
    updated_at: now,
    ...overrides,
  } as User
}

// Helper to create mock session data
export function createMockSession(): Session {
  const expiresAt = Math.floor(Date.now() / 1000) + 3600
  const mockUser = createMockUser()
  return {
    access_token: 'mock-access-token',
    token_type: 'bearer',
    expires_in: 3600,
    expires_at: expiresAt,
    refresh_token: 'mock-refresh-token',
    user: mockUser,
  }
}

// Helper to create mock user profile
export function createMockUserProfile(
  overrides: Partial<UserProfile> = {}
): UserProfile {
  const now = new Date().toISOString()
  return {
    user_id: 'test-user-id',
    full_name: 'Test User',
    avatar_url: null,
    preferences: {
      theme: 'dark',
      notifications: true,
    },
    subscription_status: 'active',
    subscription_tier: 'basic',
    created_at: now,
    updated_at: now,
    ...overrides,
  } as UserProfile
}

// Re-export testing library utilities
export * from '@testing-library/react'
