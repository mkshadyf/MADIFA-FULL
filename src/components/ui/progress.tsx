import React from 'react'
import { cn } from '@/lib/utils'

interface ProgressProps {
  value: number
  max?: number
  className?: string
  color?: string
  segments?: number
  valueText?: string
  label?: string
}

export function Progress({
  value,
  max = 100,
  className,
  color = 'bg-indigo-600',
  segments = 1,
  valueText,
  label,
  ...props
}: ProgressProps) {
  const percentage = Math.round((value / max) * 100)
  const translateClass = `translate-x-[-${100 - percentage}%]`

  return (
    <div
      role="progressbar"
      aria-valuetext={percentage.toString()}
      aria-label={label}
      className={cn(
        'relative h-2 w-full overflow-hidden rounded-full bg-gray-100',
        className
      )}
      {...props}
    >
      {segments === 1 ? (
        <div
          className={cn(
            'h-full w-full flex-1 transition-all',
            color,
            translateClass
          )}
        />
      ) : (
        <div className="flex h-full w-full">
          {Array.from({ length: segments }).map((_, i) => (
            <div
              key={i}
              className={cn(
                'flex-1 transition-all',
                i < Math.floor((value / max) * segments) ? color : 'bg-gray-100'
              )}
            />
          ))}
        </div>
      )}
    </div>
  )
}
