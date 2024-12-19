import React from 'react'

import { formatBytes } from '@/lib/utils/format'
import { useStorageQuota } from '@/hooks/useStorageQuota'

interface StorageQuotaIndicatorProps {
  className?: string
  showDetails?: boolean
}

export default function StorageQuotaIndicator({
  className = '',
  showDetails = false,
}: StorageQuotaIndicatorProps) {
  const { quotaStats } = useStorageQuota()

  return (
    <div className={`flex flex-col space-y-2 ${className}`}>
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-400">Storage</span>
        <span className="text-gray-300">
          {formatBytes(quotaStats.used)} / {formatBytes(quotaStats.quota)}
        </span>
      </div>

      <div className="relative h-2 w-full overflow-hidden rounded-full bg-gray-700">
        <div
          className={`absolute left-0 top-0 h-full transition-all duration-300 ${
            quotaStats.isNearLimit ? 'bg-yellow-500' : 'bg-indigo-600'
          }`}
          style={{ width: `${Math.min(quotaStats.percentage, 100)}%` }}
        />
      </div>

      {showDetails ? (
        <div className="mt-2 grid grid-cols-2 gap-4 text-xs text-gray-400">
          <div>
            <span className="block font-medium">Available</span>
            <span>{formatBytes(quotaStats.quota - quotaStats.used)}</span>
          </div>
          <div>
            <span className="block font-medium">Used</span>
            <span>{quotaStats.percentage.toFixed(1)}%</span>
          </div>
        </div>
      ) : null}

      {quotaStats.isNearLimit ? (
        <p className="mt-1 text-xs text-yellow-500">
          Storage space is running low. Consider removing some downloads or
          upgrading your plan.
        </p>
      ) : null}
    </div>
  )
}
