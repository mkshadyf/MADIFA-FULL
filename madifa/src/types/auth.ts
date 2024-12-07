import type { User } from '@supabase/supabase-js'

export type UserRole = 'admin' | 'moderator' | 'content_manager' | 'user'

export interface Permission {
  id: string
  name: string
  description: string
  resource: string
  action: 'create' | 'read' | 'update' | 'delete' | 'manage'
}

export interface RolePermission {
  role: UserRole
  permissions: Permission[]
}

export interface UserProfile {
  id: string
  user_id: string
  full_name: string
  email: string
  role: UserRole
  subscription_tier: string
  subscription_status: 'active' | 'past_due' | 'cancelled'
  permissions?: Permission[]
  created_at: string
  updated_at: string
  last_login?: string
  is_email_verified: boolean
  is_active: boolean
  metadata?: Record<string, any>
}

export interface AuthSession {
  user: {
    id: string
    email: string
    role: UserRole
  }
  access_token: string
  refresh_token: string
  expires_at: number
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData extends LoginCredentials {
  full_name: string
}

export interface AuthError {
  message: string
  code: string
}

export interface AuthState {
  user: User | null
  profile: UserProfile | null
  loading: boolean
  initialized: boolean
}

export interface AuthCredentials {
  email: string
  password: string
}

export interface SignUpCredentials extends AuthCredentials {
  full_name: string
}

export interface ResetPasswordCredentials {
  email: string
}

export interface UpdatePasswordCredentials {
  password: string
}

export interface AuthResponse {
  user: User | null
  profile: UserProfile | null
  error?: Error
}

export interface Session {
  id: string
  user_id: string
  created_at: string
  last_active: string
  expires_at: string
  device_info?: {
    userAgent: string
    platform: string
    browser: string
    os: string
  }
  ip_address?: string
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