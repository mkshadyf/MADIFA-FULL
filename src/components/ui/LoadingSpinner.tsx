import { cn } from '@/utils/cn'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  variant?: 'primary' | 'secondary' | 'white'
  className?: string
  fullscreen?: boolean
  text?: string
}

export function LoadingSpinner({
  size = 'md',
  variant = 'primary',
  className = '',
  fullscreen = false,
  text,
}: LoadingSpinnerProps): JSX.Element {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  }

  const variantClasses = {
    primary: 'text-primary border-current',
    secondary: 'text-secondary border-current',
    white: 'text-white border-current',
  }

  const spinnerClasses = cn(
    'animate-spin rounded-full border-2',
    'border-t-transparent',
    sizeClasses[size],
    variantClasses[variant],
    className
  )

  const spinner = (
    <div className="flex flex-col items-center justify-center">
      <div className={spinnerClasses} role="status" aria-live="polite">
        <span className="sr-only">Loading...</span>
      </div>
      {text ? (
        <p className="mt-2 text-sm text-gray-600">{text.toString()}</p>
      ) : null}
    </div>
  )

  if (fullscreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white/75 backdrop-blur-sm">
        {spinner}
      </div>
    )
  }

  return spinner
}

export default LoadingSpinner
