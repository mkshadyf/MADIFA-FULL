import type { HTMLAttributes } from 'react'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'bordered'
}

type CardHeaderProps = HTMLAttributes<HTMLDivElement>
type CardContentProps = HTMLAttributes<HTMLDivElement>

export function Card({
  variant = 'default',
  className = '',
  ...props
}: CardProps) {
  const baseClasses = 'bg-white dark:bg-gray-800 rounded-lg shadow-md'
  const variantClasses = {
    default: '',
    bordered: 'border border-gray-200 dark:border-gray-700',
  }

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      {...props}
    />
  )
}

export function CardHeader({ className = '', ...props }: CardHeaderProps) {
  return (
    <div
      className={`border-b border-gray-200 px-6 py-4 dark:border-gray-700 ${className}`}
      {...props}
    />
  )
}

export function CardContent({ className = '', ...props }: CardContentProps) {
  return <div className={`p-6 ${className}`} {...props} />
}
