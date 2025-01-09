export type Role = 'admin' | 'moderator' | 'user' | 'premium'

export interface UserRole {
  user_id: string
  role: Role
  created_at: string
}

export interface RolePermissions {
  canManageUsers: boolean
  canManageContent: boolean
  canModerateContent: boolean
  canAccessAdmin: boolean
  canDownload: boolean
  canUpload: boolean
  maxStorageGB: number
  maxDownloadsPerDay: number
}

export const DEFAULT_ROLE_PERMISSIONS: Record<Role, RolePermissions> = {
  admin: {
    canManageUsers: true,
    canManageContent: true,
    canModerateContent: true,
    canAccessAdmin: true,
    canDownload: true,
    canUpload: true,
    maxStorageGB: Infinity,
    maxDownloadsPerDay: Infinity,
  },
  moderator: {
    canManageUsers: false,
    canManageContent: true,
    canModerateContent: true,
    canAccessAdmin: true,
    canDownload: true,
    canUpload: true,
    maxStorageGB: 1000,
    maxDownloadsPerDay: 1000,
  },
  premium: {
    canManageUsers: false,
    canManageContent: false,
    canModerateContent: false,
    canAccessAdmin: false,
    canDownload: true,
    canUpload: true,
    maxStorageGB: 100,
    maxDownloadsPerDay: 100,
  },
  user: {
    canManageUsers: false,
    canManageContent: false,
    canModerateContent: false,
    canAccessAdmin: false,
    canDownload: true,
    canUpload: false,
    maxStorageGB: 10,
    maxDownloadsPerDay: 10,
  },
}
