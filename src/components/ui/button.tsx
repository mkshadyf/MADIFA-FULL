 import { type ButtonHTMLAttributes, type FC, type ReactNode } from 'react'
import { cn } from '@/lib/utils/cn'

import { LoadingSpinner } from './LoadingSpinner'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'link'
  size?: 'sm' | 'md' | 'lg'
  isLoading?: boolean
  loadingText?: string
  fullWidth?: boolean
  icon?: ReactNode
  iconPosition?: 'left' | 'right'
}

export const Button: FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  loadingText,
  fullWidth = false,
  icon,
  iconPosition = 'left',
  className = '',
  disabled,
  ...props
}): JSX.Element => {
  const baseStyles = cn(
    'inline-flex items-center justify-center rounded-md font-medium transition-colors',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
    'disabled:pointer-events-none disabled:opacity-50'
  )

  const variantStyles = {
    primary:
      'bg-primary text-white hover:bg-primary/90 focus-visible:ring-primary/50',
    secondary:
      'bg-secondary text-white hover:bg-secondary/90 focus-visible:ring-secondary/50',
    outline:
      'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus-visible:ring-gray-500/50',
    ghost:
      'text-gray-700 hover:bg-gray-100 hover:text-gray-900 focus-visible:ring-gray-500/50',
    link: 'text-primary underline-offset-4 hover:underline focus-visible:ring-primary/50',
  }

  const sizeStyles = {
    sm: 'h-8 px-3 text-xs',
    md: 'h-10 px-4 py-2',
    lg: 'h-12 px-6 text-lg',
  }

  const classes = cn(
    baseStyles,
    variantStyles[variant],
    sizeStyles[size],
    fullWidth && 'w-full',
    className
  )

  return (
    <button className={classes} disabled={isLoading || disabled} {...props}>
      {isLoading ? (
        <>
          <LoadingSpinner size="sm" variant="white" className="mr-2" />
          <span>{loadingText || children}</span>
        </>
      ) : (
        <>
          {icon && iconPosition === 'left' ? (
            <span className="mr-2">{icon}</span>
          ) : null}
          {children}
          {icon && iconPosition === 'right' ? (
            <span className="ml-2">{icon}</span>
          ) : null}
        </>
      )}
    </button>
  )
}

interface IconButtonProps extends Omit<ButtonProps, 'icon' | 'iconPosition'> {
  icon: ReactNode
  label: string
}

export const IconButton: FC<IconButtonProps> = ({
  icon,
  label,
  variant = 'ghost',
  size = 'sm',
  className = '',
  ...props
}): JSX.Element => {
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12',
  }

  return (
    <Button
      variant={variant}
      size={size}
      className={cn('p-0', sizeClasses[size], className)}
      aria-label={label}
      {...props}
    >
      {icon}
    </Button>
  )
}

export default Button
