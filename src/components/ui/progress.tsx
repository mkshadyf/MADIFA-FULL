import React from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface ProgressProps {
  value: number
  max?: number
  className?: string
  color?: string
  backgroundColor?: string
  segments?: number
  showPercentage?: boolean
  height?: number
  valueText?: string
  label?: string
  animated?: boolean
}

export function Progress({
  value,
  max = 100,
  className,
  color = 'bg-indigo-600',
  backgroundColor = 'bg-gray-100',
  segments = 1,
  showPercentage = false,
  height = 8,
  valueText,
  label,
  animated = true,
  ...props
}: ProgressProps) {
  const percentage = Math.round((value / max) * 100)

  return (
    <div className="relative w-full">
      <div
        role="progressbar"
        aria-valuetext={valueText || percentage.toString()}
        aria-label={label}
        className={cn(
          'relative overflow-hidden rounded-full',
          backgroundColor,
          className
        )}
        style={{ height }}
        {...props}
      >
        {segments === 1 ? (
          animated ? (
            <motion.div
              className={cn('h-full w-full flex-1', color)}
              initial={{ width: 0 }}
              animate={{ width: `${percentage}%` }}
              transition={{ duration: 0.3 }}
            />
          ) : (
            <div
              className={cn('h-full w-full flex-1 transition-all', color)}
              style={{ width: `${percentage}%` }}
            />
          )
        ) : (
          <div className="flex h-full w-full">
            {Array.from({ length: segments }).map((_, i) => {
              const segmentValue = (value / max) * segments
              const isActive = i < Math.floor(segmentValue)
              const isPartial = i === Math.floor(segmentValue)
              const partialWidth = (segmentValue % 1) * 100

              return (
                <div
                  key={i}
                  className={cn(
                    'h-full flex-1 border-r border-white last:border-0',
                    isActive ? color : 'bg-transparent',
                    isPartial ? 'relative overflow-hidden' : ''
                  )}
                >
                  {isPartial && (
                    <div
                      className={cn('absolute inset-0', color)}
                      style={{ width: `${partialWidth}%` }}
                    />
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
      {showPercentage && (
        <div className="absolute -top-6 right-0 text-sm text-gray-500">
          {percentage}%
        </div>
      )}
    </div>
  )
}
