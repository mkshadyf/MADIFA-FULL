import { supabase } from '@/lib/supabase/client'
import type { Session, User as SupabaseUser } from '@supabase/supabase-js'
import { AuthError } from '@supabase/supabase-js'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { AuthServiceImpl } from '../auth'

vi.mock('@/lib/supabase/client', () => ({
  supabase: {
    auth: {
      signInWithPassword: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
      getSession: vi.fn(),
      refreshSession: vi.fn(),
      updateUser: vi.fn()
    }
  }
}))

describe('AuthServiceImpl', () => {
  let authService: AuthServiceImpl

  beforeEach(() => {
    authService = new AuthServiceImpl()
    vi.clearAllMocks()
  })

  const mockUser: SupabaseUser = {
    id: '1',
    email: 'test@test.com',
    app_metadata: {},
    user_metadata: {},
    aud: 'authenticated',
    created_at: '2021-01-01T00:00:00.000Z',
    confirmed_at: '',
    email_confirmed_at: '',
    last_sign_in_at: '',
    role: '',
    updated_at: '',
    phone: '',
    phone_confirmed_at: '',
    factors: []
  }

  const mockSession: Session = {
    access_token: 'token',
    refresh_token: 'refresh',
    expires_in: 3600,
    token_type: 'bearer',
    user: mockUser
  }

  const mappedUser = {
    ...mockUser,
    email: 'test@test.com',
    email_verified: false,
    full_name: undefined,
    subscription_status: undefined,
    subscription_tier: undefined
  }

  const createAuthError = (message: string): AuthError => {
    const error = new AuthError(message)
    error.status = 400
    return error
  }

  describe('signInWithEmail', () => {
    it('should sign in user with email and password', async () => {
      vi.mocked(supabase.auth.signInWithPassword).mockResolvedValueOnce({
        data: { user: mockUser, session: mockSession },
        error: null
      })

      const result = await authService.signInWithEmail('test@test.com', 'password')

      expect(result.user).toEqual(mappedUser)
      expect(result.session).toEqual(mockSession)
    })

    it('should throw error on sign in failure', async () => {
      const error = createAuthError('Invalid credentials')
      vi.mocked(supabase.auth.signInWithPassword).mockResolvedValueOnce({
        data: { user: null, session: null },
        error
      })

      await expect(authService.signInWithEmail('test@test.com', 'password')).rejects.toThrow('Invalid credentials')
    })
  })

  describe('signUpWithEmail', () => {
    it('should sign up user with email and password', async () => {
      vi.mocked(supabase.auth.signUp).mockResolvedValueOnce({
        data: { user: mockUser, session: mockSession },
        error: null
      })

      const result = await authService.signUpWithEmail('test@test.com', 'password')

      expect(result.user).toEqual(mappedUser)
      expect(result.session).toEqual(mockSession)
    })

    it('should throw error on sign up failure', async () => {
      const error = createAuthError('Email already exists')
      vi.mocked(supabase.auth.signUp).mockResolvedValueOnce({
        data: { user: null, session: null },
        error
      })

      await expect(authService.signUpWithEmail('test@test.com', 'password')).rejects.toThrow('Email already exists')
    })
  })

  describe('signOut', () => {
    it('should sign out user', async () => {
      vi.mocked(supabase.auth.signOut).mockResolvedValueOnce({ error: null })

      await expect(authService.signOut()).resolves.toBeUndefined()
    })

    it('should throw error on sign out failure', async () => {
      const error = createAuthError('Sign out failed')
      vi.mocked(supabase.auth.signOut).mockResolvedValueOnce({ error })

      await expect(authService.signOut()).rejects.toThrow('Sign out failed')
    })
  })

  describe('getSession', () => {
    it('should get current session', async () => {
      vi.mocked(supabase.auth.getSession).mockResolvedValueOnce({
        data: { session: mockSession },
        error: null
      } as any)

      const result = await authService.getSession()

      expect(result).toEqual({
        user: mappedUser,
        session: mockSession
      })
    })

    it('should handle null session', async () => {
      vi.mocked(supabase.auth.getSession).mockResolvedValueOnce({
        data: { session: null },
        error: null
      } as any)

      const result = await authService.getSession()

      expect(result).toEqual({
        user: null,
        session: null
      })
    })

    it('should throw error on session retrieval failure', async () => {
      const error = createAuthError('Session retrieval failed')
      vi.mocked(supabase.auth.getSession).mockResolvedValueOnce({
        data: { session: null },
        error
      } as any)

      await expect(authService.getSession()).rejects.toThrow('Session retrieval failed')
    })
  })

  describe('refreshSession', () => {
    it('should refresh current session', async () => {
      vi.mocked(supabase.auth.refreshSession).mockResolvedValueOnce({
        data: { session: mockSession },
        error: null
      } as any)

      const result = await authService.refreshSession()

      expect(result).toEqual({
        user: mappedUser,
        session: mockSession
      })
    })

    it('should handle null session', async () => {
      vi.mocked(supabase.auth.refreshSession).mockResolvedValueOnce({
        data: { session: null },
        error: null
      } as any)

      const result = await authService.refreshSession()

      expect(result).toEqual({
        user: null,
        session: null
      })
    })

    it('should throw error on session refresh failure', async () => {
      const error = createAuthError('Session refresh failed')
      vi.mocked(supabase.auth.refreshSession).mockResolvedValueOnce({
        data: { session: null },
        error
      } as any)

      await expect(authService.refreshSession()).rejects.toThrow('Session refresh failed')
    })
  })

  describe('updateProfile', () => {
    it('should update user profile', async () => {
      vi.mocked(supabase.auth.updateUser).mockResolvedValueOnce({
        data: { user: mockUser },
        error: null
      })

      const result = await authService.updateProfile({ email: 'new@test.com' })

      expect(result.user).toEqual(mappedUser)
      expect(result.error).toBeNull()
    })

    it('should handle update failure', async () => {
      const error = createAuthError('Update failed')
      vi.mocked(supabase.auth.updateUser).mockResolvedValueOnce({
        data: { user: null },
        error
      })

      const result = await authService.updateProfile({ email: 'new@test.com' })

      expect(result.user).toBeNull()
      expect(result.error).toEqual({ name: error.name, message: error.message })
    })
  })
}) 