export interface UserProfile {
  id: string
  userId: string
  fullName: string | null
  avatarUrl: string | null
  email: string
  stripeCustomerId?: string
  createdAt: string
  updatedAt: string
}

export interface UserSettings {
  id: string
  userId: string
  emailNotifications: boolean
  theme: 'light' | 'dark' | 'system'
  language: string
  autoplay: boolean
  quality: 'auto' | '1080p' | '720p' | '480p'
}

export interface UserSession {
  id: string
  userId: string
  deviceId: string
  deviceType: string
  ipAddress: string
  lastActive: string
  createdAt: string
}

export interface UserActivity {
  id: string
  userId: string
  type: 'watch' | 'like' | 'comment' | 'share'
  contentId?: string
  metadata: Record<string, any>
  createdAt: string
} 
