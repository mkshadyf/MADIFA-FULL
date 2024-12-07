import { sessionService } from '@/lib/services/session'

export async function withAuth(request: () => Promise<any>) {
  try {
    return await request()
  } catch (error) {
    if (error && typeof error === 'object' && 'status' in error && error.status === 401) {
      // Try to refresh the session
      const session = await sessionService.refreshSession()
      if (session) {
        // Retry the original request
        return await request()
      }
      // If refresh failed, redirect to login
      window.location.href = '/auth/signin'
    }
    throw error
  }
} 