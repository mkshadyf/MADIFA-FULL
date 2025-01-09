export interface QuotaCheckResult {
  allowed: boolean
  canProceed: boolean
  currentUsage: number
  quota: number
  remaining: number
  error?: string
  isNearLimit?: boolean
}

export interface QuotaEnforcement {
  checkQuota: (userId: string, size: number) => Promise<QuotaCheckResult | null>
  updateUsage: (size: number) => Promise<void>
  getUsage: () => Promise<{ used: number; total: number }>
}

export interface StorageQuota {
  used: number
  total: number
  remaining: number
  percentUsed: number
}

export type QuotaStatus = 'ok' | 'warning' | 'exceeded'
