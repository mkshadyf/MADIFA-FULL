import type { Session, SessionInfo } from '@/types/auth'

const SESSION_REFRESH_THRESHOLD = 5 * 60 * 1000 // 5 minutes in milliseconds

export class SessionManager {
  private static instance: SessionManager
  private refreshPromise: Promise<void> | null = null
  private refreshTimeout: NodeJS.Timeout | null = null

  private constructor() {}

  static getInstance(): SessionManager {
    if (!SessionManager.instance) {
      SessionManager.instance = new SessionManager()
    }
    return SessionManager.instance
  }

  getSessionInfo(session: Session | null): SessionInfo {
    if (!session) {
      return { isValid: false, expiresAt: 0, needsRefresh: false }
    }

    const now = Date.now()
    const expiresAt = new Date(session.expires_at!).getTime()
    const timeUntilExpiry = expiresAt - now

    return {
      isValid: timeUntilExpiry > 0,
      expiresAt,
      needsRefresh: timeUntilExpiry <= SESSION_REFRESH_THRESHOLD,
    }
  }

  scheduleRefresh(
    session: Session | null,
    refreshCallback: () => Promise<void>
  ): void {
    if (this.refreshTimeout) {
      clearTimeout(this.refreshTimeout)
      this.refreshTimeout = null
    }

    if (!session) return

    const { needsRefresh, expiresAt } = this.getSessionInfo(session)
    if (!needsRefresh) {
      const timeUntilRefresh =
        expiresAt - Date.now() - SESSION_REFRESH_THRESHOLD
      this.refreshTimeout = setTimeout(() => {
        void this.refreshSession(refreshCallback)
      }, timeUntilRefresh)
    } else {
      void this.refreshSession(refreshCallback)
    }
  }

  private async refreshSession(
    refreshCallback: () => Promise<void>
  ): Promise<void> {
    // Prevent multiple simultaneous refresh attempts
    if (this.refreshPromise) {
      return this.refreshPromise
    }

    try {
      this.refreshPromise = refreshCallback()
      await this.refreshPromise
    } catch (error) {
      console.error('Failed to refresh session:', error)
    } finally {
      this.refreshPromise = null
    }
  }

  clearRefreshSchedule(): void {
    if (this.refreshTimeout) {
      clearTimeout(this.refreshTimeout)
      this.refreshTimeout = null
    }
  }
}

export const sessionManager = SessionManager.getInstance()
