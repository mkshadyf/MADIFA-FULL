import React from 'react'

import { cn } from '@/lib/utils'

interface SliderProps {
  value: number[]
  onValueChange: (value: number[]) => void
  max: number
  min?: number
  step?: number
  className?: string
  label?: string
  ariaLabel?: string
}

export function Slider({
  value,
  onValueChange,
  max,
  min = 0,
  step = 1,
  className,
  label,
  ariaLabel,
}: SliderProps) {
  const percentage = ((value[0] - min) / (max - min)) * 100
  const id = React.useId()

  return (
    <div
      className={cn('group relative h-2 w-full', className)}
      role="group"
      aria-labelledby={id}
    >
      {label ? (
        <label id={id} className="sr-only">
          {label}
        </label>
      ) : null}
      <div className="absolute top-1/2 h-1 w-full -translate-y-1/2 rounded-full bg-gray-200" />
      <div
        className="absolute top-1/2 h-1 -translate-y-1/2 rounded-full bg-primary"
        style={{ width: `${percentage}%` }}
      />
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value[0]}
        onChange={e => onValueChange([Number(e.target.value)])}
        className={cn(
          'absolute h-2 w-full cursor-pointer opacity-0',
          'range-input::-webkit-slider-thumb:hover:scale-110',
          'range-input::-moz-range-thumb:hover:scale-110'
        )}
        aria-label={ariaLabel || label}
      />
      <div
        className={cn(
          'absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary',
          'transition-transform group-hover:scale-110'
        )}
        style={{ left: `${percentage}%` }}
        role="presentation"
      />
    </div>
  )
}
