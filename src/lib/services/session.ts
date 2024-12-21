import { UAParser } from 'ua-parser-js'

import { createAPIError } from '@/lib/error'
import { supabase } from '@/lib/supabase/client'

export interface Session {
  id: string
  user_id: string
  device_info: {
    userAgent: string
    platform: string
    browser: string
    os: string
  }
  created_at: string
  expires_at: string
  last_accessed_at: string
}

export interface AuthSettings {
  allowedDomains: string[]
  passwordMinLength: number
  passwordRequirements: {
    uppercase: boolean
    lowercase: boolean
    numbers: boolean
    symbols: boolean
  }
  maxLoginAttempts: number
  lockoutDuration: number
  sessionDuration: number
  requireEmailVerification: boolean
}

const DEFAULT_SESSION_DURATION = 24 * 60 * 60 // 24 hours in seconds
const MAX_SESSIONS_PER_USER = 5

export class SessionService {
  private settings: AuthSettings = {
    allowedDomains: [],
    passwordMinLength: 8,
    passwordRequirements: {
      uppercase: true,
      lowercase: true,
      numbers: true,
      symbols: true,
    },
    maxLoginAttempts: 5,
    lockoutDuration: 15 * 60, // 15 minutes
    sessionDuration: DEFAULT_SESSION_DURATION,
    requireEmailVerification: true,
  }

  async createSession(userId: string, userAgent: string): Promise<Session> {
    try {
      // Parse user agent
      const parser = new UAParser(userAgent)
      const deviceInfo = {
        userAgent,
        platform: parser.getOS().name || 'Unknown',
        browser: parser.getBrowser().name || 'Unknown',
        os: parser.getOS().name || 'Unknown',
      }

      // Check existing sessions
      const { data: existingSessions } = await supabase
        .from('sessions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      // Remove oldest session if limit exceeded
      if (
        existingSessions &&
        existingSessions.length >= MAX_SESSIONS_PER_USER
      ) {
        const oldestSession = existingSessions[existingSessions.length - 1]
        await this.deleteSession(oldestSession.id)
      }

      // Create new session
      const { data, error } = await supabase
        .from('sessions')
        .insert({
          user_id: userId,
          device_info: deviceInfo,
          expires_at: new Date(
            Date.now() + this.settings.sessionDuration * 1000
          ).toISOString(),
        })
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      throw createAPIError(
        500,
        'Failed to create session',
        'CREATE_SESSION_ERROR',
        error
      )
    }
  }

  async validateSession(sessionId: string): Promise<boolean> {
    try {
      const { data: session, error } = await supabase
        .from('sessions')
        .select('*')
        .eq('id', sessionId)
        .single()

      if (error) throw error

      if (!session) return false

      // Check if session has expired
      if (new Date(session.expires_at) < new Date()) {
        await this.deleteSession(sessionId)
        return false
      }

      // Update last active timestamp
      await supabase
        .from('sessions')
        .update({ last_active: new Date().toISOString() })
        .eq('id', sessionId)

      return true
    } catch (error) {
      console.error('Session validation error:', error)
      return false
    }
  }

  async getUserSessions(userId: string): Promise<Session[]> {
    try {
      const { data, error } = await supabase
        .from('sessions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data
    } catch (error) {
      throw createAPIError(
        500,
        'Failed to get user sessions',
        'GET_SESSIONS_ERROR',
        error
      )
    }
  }

  async deleteSession(sessionId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('sessions')
        .delete()
        .eq('id', sessionId)

      if (error) throw error
    } catch (error) {
      throw createAPIError(
        500,
        'Failed to delete session',
        'DELETE_SESSION_ERROR',
        error
      )
    }
  }

  async deleteAllUserSessions(
    userId: string,
    exceptSessionId?: string
  ): Promise<void> {
    try {
      let query = supabase.from('sessions').delete().eq('user_id', userId)

      if (exceptSessionId) {
        query = query.neq('id', exceptSessionId)
      }

      const { error } = await query
      if (error) throw error
    } catch (error) {
      throw createAPIError(
        500,
        'Failed to delete user sessions',
        'DELETE_SESSIONS_ERROR',
        error
      )
    }
  }

  async cleanupExpiredSessions(): Promise<void> {
    try {
      const { error } = await supabase
        .from('sessions')
        .delete()
        .lt('expires_at', new Date().toISOString())

      if (error) throw error
    } catch (error) {
      throw createAPIError(
        500,
        'Failed to cleanup expired sessions',
        'CLEANUP_SESSIONS_ERROR',
        error
      )
    }
  }

  async extendSession(sessionId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('sessions')
        .update({
          expires_at: new Date(
            Date.now() + this.settings.sessionDuration * 1000
          ).toISOString(),
          last_active: new Date().toISOString(),
        })
        .eq('id', sessionId)

      if (error) throw error
    } catch (error) {
      throw createAPIError(
        500,
        'Failed to extend session',
        'EXTEND_SESSION_ERROR',
        error
      )
    }
  }

  async updateSettings(settings: Partial<AuthSettings>): Promise<void> {
    this.settings = {
      ...this.settings,
      ...settings,
    }
  }

  getSettings(): AuthSettings {
    return { ...this.settings }
  }
}

export const sessionService = new SessionService()
