import * as SliderPrimitive from '@radix-ui/react-slider'
import type { ComponentPropsWithoutRef } from 'react'

interface SliderProps
  extends ComponentPropsWithoutRef<typeof SliderPrimitive.Root> {
  value: number[]
  onValueChange: (value: number[]) => void
  max: number
  step?: number
  min?: number
  className?: string
}

export function Slider({
  value,
  onValueChange,
  max,
  step = 1,
  min = 0,
  className = '',
  ...props
}: SliderProps) {
  return (
    <SliderPrimitive.Root
      className={`relative flex h-5 w-full touch-none select-none items-center ${className}`}
      value={value}
      onValueChange={onValueChange}
      max={max}
      step={step}
      min={min}
      {...props}
    >
      <SliderPrimitive.Track className="relative h-1 w-full grow rounded-full bg-gray-200 dark:bg-gray-700">
        <SliderPrimitive.Range className="absolute h-full rounded-full bg-indigo-600" />
      </SliderPrimitive.Track>
      <SliderPrimitive.Thumb
        className="focus-visible:ring-ring block h-3 w-3 rounded-full bg-indigo-600 ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
        aria-label="Seek time"
      />
    </SliderPrimitive.Root>
  )
}
