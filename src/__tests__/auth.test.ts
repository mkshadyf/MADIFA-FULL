import type { Session, User } from '@supabase/supabase-js'
import { createClient } from '@supabase/supabase-js'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { AuthService } from '@/lib/services/auth'

// Create mock auth error
class MockAuthError extends Error {
  code: string
  status: number
  __isAuthError: true

  constructor(message: string) {
    super(message)
    this.code = 'mock_error'
    this.status = 400
    this.__isAuthError = true
  }
}

// Mock Supabase client
const mockAuth = {
  signInWithPassword: vi.fn(),
  signInWithOAuth: vi.fn(),
  signUp: vi.fn(),
  getSession: vi.fn(),
  refreshSession: vi.fn(),
}

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    auth: mockAuth,
  })),
}))

describe('AuthService', () => {
  let authService: AuthService
  let mockSupabaseClient: ReturnType<typeof createClient>
  const mockUser: User = {
    id: 'user123',
    email: 'test@example.com',
    app_metadata: {},
    user_metadata: {},
    aud: 'authenticated',
    created_at: '2023-01-01',
  }
  const mockSession: Session = {
    access_token: 'token123',
    refresh_token: 'refresh123',
    expires_in: 3600,
    token_type: 'bearer',
    user: mockUser,
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockSupabaseClient = createClient('test-url', 'test-key')

    mockAuth.signInWithPassword.mockResolvedValue({
      data: { user: mockUser, session: mockSession },
      error: null,
    })

    mockAuth.signInWithOAuth.mockResolvedValue({
      data: { provider: 'google', url: 'test-url' },
      error: null,
    })

    mockAuth.signUp.mockResolvedValue({
      data: { user: mockUser, session: mockSession },
      error: null,
    })

    mockAuth.getSession.mockResolvedValue({
      data: { session: mockSession },
      error: null,
    })

    mockAuth.refreshSession.mockResolvedValue({
      data: { user: mockUser, session: mockSession },
      error: null,
    })

    authService = new AuthService()
    // @ts-ignore - Accessing private property for testing
    authService['supabase'] = mockSupabaseClient
  })

  describe('signInWithEmail', () => {
    it('should successfully sign in with valid credentials', async () => {
      const result = await authService.signInWithEmail(
        'test@example.com',
        'password123'
      )
      expect(result.user).toEqual(mockUser)
      expect(mockAuth.signInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      })
    })

    it('should handle sign in errors', async () => {
      const mockError = new MockAuthError('Invalid credentials')
      mockAuth.signInWithPassword.mockResolvedValueOnce({
        data: { user: null, session: null },
        error: mockError,
      })

      await expect(
        authService.signInWithEmail('test@example.com', 'wrongpassword')
      ).rejects.toThrow('Invalid credentials')
    })
  })

  describe('signInWithProvider', () => {
    it('should initiate OAuth sign in', async () => {
      const result = await authService.signInWithProvider('google')
      expect(result.user).toBeNull()
      expect(mockAuth.signInWithOAuth).toHaveBeenCalledWith({
        provider: 'google',
        options: expect.any(Object),
      })
    })

    it('should handle OAuth errors', async () => {
      const mockError = new MockAuthError('OAuth failed')
      mockAuth.signInWithOAuth.mockResolvedValueOnce({
        data: { provider: 'google', url: null },
        error: mockError,
      })

      await expect(authService.signInWithProvider('google')).rejects.toThrow(
        'OAuth failed'
      )
    })
  })

  describe('signUp', () => {
    it('should successfully create a new account', async () => {
      const result = await authService.signUp(
        'test@example.com',
        'password123',
        'Test User'
      )
      expect(result.user).toEqual(mockUser)
      expect(mockAuth.signUp).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
        options: {
          emailRedirectTo: expect.any(String),
          data: {
            fullName: 'Test User',
          },
        },
      })
    })

    it('should handle sign up errors', async () => {
      const mockError = new MockAuthError('Email already exists')
      mockAuth.signUp.mockResolvedValueOnce({
        data: { user: null, session: null },
        error: mockError,
      })

      await expect(
        authService.signUp('test@example.com', 'password123', 'Test User')
      ).rejects.toThrow('Email already exists')
    })
  })

  describe('session management', () => {
    it('should get current session', async () => {
      const session = await authService.getSession()
      expect(session).toEqual(mockSession)
      expect(mockAuth.getSession).toHaveBeenCalled()
    })

    it('should refresh session', async () => {
      const session = await authService.refreshSession()
      expect(session).toEqual(mockSession)
      expect(mockAuth.refreshSession).toHaveBeenCalled()
    })
  })
})
