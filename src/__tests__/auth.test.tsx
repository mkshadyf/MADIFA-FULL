import React from 'react'
import { AuthProvider } from '../providers/AuthProvider'
import type {
  AuthError,
  AuthResponse,
  Session,
  SupabaseClient,
  User,
} from '@supabase/supabase-js'
import { fireEvent, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Mock } from 'vitest'

import SignInPage from '../pages/auth/signin/page'
import SignUpPage from '../pages/auth/signup/page'
import {
  createMockAuthResponse,
  createMockDataResponse,
  createMockSession,
  createMockUser,
  createMockUserProfile,
  renderWithProviders,
  type SupabaseDataResponse,
} from '../test/utils'
import type { UserProfile } from '../types/auth'

// Define proper auth credential types
interface EmailAuthCredentials {
  email: string
  password: string
  options?: {
    emailRedirectTo?: string
    data?: Record<string, unknown>
    captchaToken?: string
  }
}

// Mock modules first
vi.mock('../lib/supabase/client', () => ({
  createClient: () => mockSupabaseClient,
}))

vi.mock('../components/ui/toast', () => ({
  toast: mockToast,
}))

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useSearchParams: () => [new URLSearchParams()],
  }
})

// Mock implementations
const mockToast = {
  success: vi.fn(),
  error: vi.fn(),
}

const mockNavigate = vi.fn()

// Create strongly typed mock functions with proper return types
const mockSignInWithPassword = vi.fn() as Mock<
  [EmailAuthCredentials],
  Promise<AuthResponse>
>
const mockSignUp = vi.fn() as Mock<
  [EmailAuthCredentials],
  Promise<AuthResponse>
>
const mockSignOut = vi.fn() as Mock<[], Promise<{ error: AuthError | null }>>
const mockGetSession = vi.fn() as Mock<[], Promise<AuthResponse>>
const mockSingle = vi.fn() as Mock<
  [],
  Promise<SupabaseDataResponse<UserProfile>>
>
const mockInsert = vi.fn() as Mock<
  [Partial<UserProfile>],
  Promise<SupabaseDataResponse<UserProfile>>
>

// Mock Supabase client with proper typing
const mockSupabaseClient = {
  auth: {
    signInWithPassword: mockSignInWithPassword,
    signUp: mockSignUp,
    signOut: mockSignOut,
    getSession: mockGetSession,
    onAuthStateChange: vi.fn(() => ({
      data: { subscription: { unsubscribe: vi.fn() } },
    })),
    signInWithOAuth: vi.fn(),
    refreshSession: vi.fn(),
  },
  from: vi.fn((table: string) => ({
    select: vi.fn(() => ({
      eq: vi.fn((column: string, value: string) => ({
        single: mockSingle,
      })),
    })),
    insert: mockInsert,
  })),
} as unknown as SupabaseClient

// Set up default implementations with proper error handling
mockSignInWithPassword.mockImplementation(
  async (credentials: EmailAuthCredentials) => {
    if (!credentials.email || !credentials.password) {
      return createMockAuthResponse(
        null,
        null,
        new Error('Email and password are required')
      )
    }
    const mockUser = createMockUser({ email: credentials.email })
    const mockSession = createMockSession()
    return createMockAuthResponse(mockUser, mockSession)
  }
)

mockSignUp.mockImplementation(async (credentials: EmailAuthCredentials) => {
  if (!credentials.email || !credentials.password) {
    return createMockAuthResponse(
      null,
      null,
      new Error('Email and password are required')
    )
  }
  const mockUser = createMockUser({ email: credentials.email })
  return createMockAuthResponse(mockUser, null)
})

mockSignOut.mockImplementation(async () => {
  return { error: null }
})

mockGetSession.mockImplementation(async () => {
  const mockUser = createMockUser()
  const mockSession = createMockSession()
  return createMockAuthResponse(mockUser, mockSession)
})

mockSingle.mockImplementation(async () => {
  const mockProfile = createMockUserProfile()
  return createMockDataResponse<UserProfile>(mockProfile)
})

mockInsert.mockImplementation(async (profile: Partial<UserProfile>) => {
  if (!profile.user_id) {
    return createMockDataResponse<UserProfile>(
      null,
      new Error('user_id is required')
    )
  }
  const mockProfile = createMockUserProfile(profile)
  return createMockDataResponse<UserProfile>(mockProfile)
})

describe('Authentication Flow', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockNavigate.mockReset()
    mockToast.success.mockReset()
    mockToast.error.mockReset()
  })

  describe('Sign In', () => {
    it('should render sign in form', () => {
      renderWithProviders(<SignInPage />)

      expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
      expect(
        screen.getByRole('button', { name: /sign in/i })
      ).toBeInTheDocument()
    })

    it('should handle successful sign in', async () => {
      const mockUser = createMockUser()
      const mockSession = createMockSession()
      const mockProfile = createMockUserProfile()

      mockSignInWithPassword.mockImplementationOnce(
        async (credentials: EmailAuthCredentials) => {
          expect(credentials).toEqual({
            email: 'test@example.com',
            password: 'password123',
          })
          return createMockAuthResponse(mockUser, mockSession)
        }
      )

      mockSingle.mockImplementationOnce(async () => {
        return createMockDataResponse(mockProfile)
      })

      renderWithProviders(<SignInPage />)

      fireEvent.change(screen.getByLabelText(/email/i), {
        target: { value: 'test@example.com' },
      })
      fireEvent.change(screen.getByLabelText(/password/i), {
        target: { value: 'password123' },
      })
      fireEvent.click(screen.getByRole('button', { name: /sign in/i }))

      await waitFor(() => {
        expect(mockSignInWithPassword).toHaveBeenCalledTimes(1)
        expect(mockToast.success).toHaveBeenCalledWith('Successfully signed in')
        expect(mockNavigate).toHaveBeenCalledWith('/')
      })
    })

    it('should handle sign in error', async () => {
      const error = new Error('Invalid credentials')

      mockSignInWithPassword.mockImplementationOnce(async () => {
        return createMockAuthResponse(null, null, error)
      })

      renderWithProviders(<SignInPage />)

      fireEvent.change(screen.getByLabelText(/email/i), {
        target: { value: 'test@example.com' },
      })
      fireEvent.change(screen.getByLabelText(/password/i), {
        target: { value: 'wrongpassword' },
      })
      fireEvent.click(screen.getByRole('button', { name: /sign in/i }))

      await waitFor(() => {
        expect(mockSignInWithPassword).toHaveBeenCalledTimes(1)
        expect(mockToast.error).toHaveBeenCalledWith(
          expect.stringContaining(error.message)
        )
        expect(mockNavigate).not.toHaveBeenCalled()
      })
    })
  })

  describe('Sign Up', () => {
    const validSignUpData = {
      fullName: 'Test User',
      email: 'test@example.com',
      password: 'password123',
    }

    it('should render sign up form', () => {
      renderWithProviders(<SignUpPage />)

      expect(screen.getByLabelText(/full name/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
      expect(
        screen.getByRole('button', { name: /create account/i })
      ).toBeInTheDocument()
    })

    it('should handle successful sign up', async () => {
      const mockUser = createMockUser({ email: validSignUpData.email })
      const mockProfile = createMockUserProfile({
        user_id: mockUser.id,
        full_name: validSignUpData.fullName,
        email: validSignUpData.email,
      })

      mockSignUp.mockImplementationOnce(
        async (credentials: EmailAuthCredentials) => {
          expect(credentials).toEqual({
            email: validSignUpData.email,
            password: validSignUpData.password,
            options: {
              emailRedirectTo: expect.any(String),
            },
          })
          return createMockAuthResponse(mockUser, null)
        }
      )

      mockInsert.mockImplementationOnce(
        async (profile: Partial<UserProfile>) => {
          expect(profile).toMatchObject({
            user_id: mockUser.id,
            full_name: validSignUpData.fullName,
            email: validSignUpData.email,
          })
          return createMockDataResponse(mockProfile)
        }
      )

      renderWithProviders(<SignUpPage />)

      fireEvent.change(screen.getByLabelText(/full name/i), {
        target: { value: validSignUpData.fullName },
      })
      fireEvent.change(screen.getByLabelText(/email/i), {
        target: { value: validSignUpData.email },
      })
      fireEvent.change(screen.getByLabelText(/password/i), {
        target: { value: validSignUpData.password },
      })
      fireEvent.click(screen.getByLabelText(/terms/i))
      fireEvent.click(screen.getByRole('button', { name: /create account/i }))

      await waitFor(() => {
        expect(mockSignUp).toHaveBeenCalledTimes(1)
        expect(mockInsert).toHaveBeenCalledTimes(1)
        expect(mockToast.success).toHaveBeenCalledWith(
          'Registration successful! Please check your email to verify your account.'
        )
        expect(mockNavigate).toHaveBeenCalledWith('/auth/verify-email')
      })
    })

    it('should handle sign up error', async () => {
      const error = new Error('Email already in use')

      mockSignUp.mockImplementationOnce(async () => {
        return createMockAuthResponse(null, null, error)
      })

      renderWithProviders(<SignUpPage />)

      fireEvent.change(screen.getByLabelText(/full name/i), {
        target: { value: validSignUpData.fullName },
      })
      fireEvent.change(screen.getByLabelText(/email/i), {
        target: { value: validSignUpData.email },
      })
      fireEvent.change(screen.getByLabelText(/password/i), {
        target: { value: validSignUpData.password },
      })
      fireEvent.click(screen.getByLabelText(/terms/i))
      fireEvent.click(screen.getByRole('button', { name: /create account/i }))

      await waitFor(() => {
        expect(mockSignUp).toHaveBeenCalledTimes(1)
        expect(mockInsert).not.toHaveBeenCalled()
        expect(mockToast.error).toHaveBeenCalledWith(
          expect.stringContaining(error.message)
        )
        expect(mockNavigate).not.toHaveBeenCalled()
      })
    })
  })

  describe('Session Management', () => {
    it('should handle session refresh', async () => {
      const mockUser = createMockUser()
      const mockSession = createMockSession()
      const mockProfile = createMockUserProfile({ user_id: mockUser.id })

      mockGetSession.mockImplementationOnce(async () => {
        return createMockAuthResponse(mockUser, mockSession)
      })

      mockSingle.mockImplementationOnce(async () => {
        return createMockDataResponse(mockProfile)
      })

      renderWithProviders(
        <AuthProvider>
          <div>Test Component</div>
        </AuthProvider>
      )

      await waitFor(() => {
        expect(mockGetSession).toHaveBeenCalledTimes(1)
        expect(mockSingle).toHaveBeenCalledTimes(1)
        expect(mockSingle).toHaveBeenCalledWith()
      })
    })

    it('should handle session expiry', async () => {
      const error = new Error('Session expired')

      mockGetSession.mockImplementationOnce(async () => {
        return createMockAuthResponse(null, null, error)
      })

      renderWithProviders(
        <AuthProvider>
          <div>Test Component</div>
        </AuthProvider>
      )

      await waitFor(() => {
        expect(mockGetSession).toHaveBeenCalledTimes(1)
        expect(mockToast.error).toHaveBeenCalledWith(
          expect.stringContaining(error.message)
        )
      })
    })
  })
})

describe('Form Validation', () => {
  const invalidEmail = 'invalid-email'
  const shortPassword = '123'
  const validEmail = 'test@example.com'
  const validPassword = 'password123'
  const validName = 'Test User'

  it('should validate email format', async () => {
    renderWithProviders(<SignInPage />)

    const emailInput = screen.getByLabelText(/email/i)
    const submitButton = screen.getByRole('button', { name: /sign in/i })

    fireEvent.change(emailInput, { target: { value: invalidEmail } })
    fireEvent.blur(emailInput)
    expect(submitButton).toBeDisabled()

    fireEvent.change(emailInput, { target: { value: validEmail } })
    fireEvent.blur(emailInput)
    expect(submitButton).not.toBeDisabled()
  })

  it('should validate password length', async () => {
    renderWithProviders(<SignUpPage />)

    const passwordInput = screen.getByLabelText(/password/i)
    const submitButton = screen.getByRole('button', { name: /create account/i })

    fireEvent.change(passwordInput, { target: { value: shortPassword } })
    fireEvent.blur(passwordInput)
    expect(submitButton).toBeDisabled()

    fireEvent.change(passwordInput, { target: { value: validPassword } })
    fireEvent.blur(passwordInput)
    expect(submitButton).not.toBeDisabled()
  })

  it('should require terms acceptance', async () => {
    renderWithProviders(<SignUpPage />)

    const nameInput = screen.getByLabelText(/full name/i)
    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/password/i)
    const termsCheckbox = screen.getByLabelText(/terms/i)
    const submitButton = screen.getByRole('button', { name: /create account/i })

    // Fill in valid data
    fireEvent.change(nameInput, { target: { value: validName } })
    fireEvent.change(emailInput, { target: { value: validEmail } })
    fireEvent.change(passwordInput, { target: { value: validPassword } })
    expect(submitButton).toBeDisabled()

    // Accept terms
    fireEvent.click(termsCheckbox)
    expect(submitButton).not.toBeDisabled()

    // Unaccept terms
    fireEvent.click(termsCheckbox)
    expect(submitButton).toBeDisabled()
  })
})
