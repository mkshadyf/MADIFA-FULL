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
  ariaLabel
}: SliderProps) {
  const percentage = ((value[0] - min) / (max - min)) * 100
  const id = React.useId()

  return (
    <div className={cn('relative w-full h-2 group', className)} role="group" aria-labelledby={id}>
      {label && <label id={id} className="sr-only">{label}</label>}
      <div className="absolute w-full h-1 bg-gray-200 rounded-full top-1/2 -translate-y-1/2" />
      <div
        className="absolute h-1 bg-primary rounded-full top-1/2 -translate-y-1/2"
        style={{ width: `${percentage}%` }}
      />
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value[0]}
        onChange={(e) => onValueChange([Number(e.target.value)])}
        className={cn(
          'absolute w-full h-2 opacity-0 cursor-pointer',
          'range-input::-webkit-slider-thumb:hover:scale-110',
          'range-input::-moz-range-thumb:hover:scale-110'
        )}
        aria-label={ariaLabel || label}
        
      />
      <div
        className={cn(
          'absolute w-4 h-4 bg-primary rounded-full top-1/2 -translate-x-1/2 -translate-y-1/2',
          'transition-transform group-hover:scale-110'
        )}
        style={{ left: `${percentage}%` }}
        role="presentation"
      />
    </div>
  )
} 