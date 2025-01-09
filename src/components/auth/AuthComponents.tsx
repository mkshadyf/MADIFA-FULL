import { cn } from '@/lib/utils/cn';
import type { ButtonHTMLAttributes, InputHTMLAttributes } from 'react';
import React from 'react';
import { LoadingSpinner } from '../ui/LoadingSpinner';

interface AuthButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  isLoading?: boolean
  loadingText?: string
}

export function AuthButton({
  className,
  variant = 'primary',
  size = 'md',
  isLoading,
  loadingText,
  children,
  ...props
}: AuthButtonProps) {
  return (
    <button
      className={cn(
        'flex items-center justify-center rounded-lg font-medium transition-colors',
        {
          'bg-primary text-white hover:bg-primary/90': variant === 'primary',
          'bg-secondary text-primary hover:bg-secondary/90':
            variant === 'secondary',
          'border-input border bg-background hover:bg-accent':
            variant === 'outline',
          'h-8 px-3 text-sm': size === 'sm',
          'h-10 px-4': size === 'md',
          'h-12 px-6': size === 'lg',
        },
        className
      )}
      disabled={isLoading}
      {...props}
    >
      {isLoading ? (
        <>
          <LoadingSpinner size="sm" className="mr-2" />
          {loadingText || 'Loading...'}
        </>
      ) : (
        children
      )}
    </button>
  )
}

interface AuthCardProps {
  children: React.ReactNode
  className?: string
  title?: string
  subtitle?: React.ReactNode
}

export function AuthCard({
  children,
  className,
  title,
  subtitle,
}: AuthCardProps) {
  return (
    <div className={cn('bg-card rounded-lg border p-6 shadow-sm', className)}>
      {title && (
        <h2 className="text-2xl font-bold tracking-tight text-white">
          {title}
        </h2>
      )}
      {subtitle && <p className="mt-2 text-sm text-gray-400">{subtitle}</p>}
      {children}
    </div>
  )
}

interface AuthInputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string
  label?: string
}

export function AuthInput({
  className,
  error,
  label,
  ...props
}: AuthInputProps) {
  return (
    <div className="space-y-1">
      {label && (
        <label className="text-sm font-medium text-white">{label}</label>
      )}
      <input
        className={cn(
          'border-input h-10 w-full rounded-md border bg-background px-3',
          'placeholder:text-muted-foreground text-sm',
          'focus:outline-none focus:ring-2 focus:ring-primary',
          { 'border-destructive': error },
          className
        )}
        {...props}
      />
      {error && <p className="text-destructive text-xs">{error}</p>}
    </div>
  )
}

export function SocialAuthButtons() {
  return (
    <div className="flex flex-col gap-2">
      <AuthButton
        variant="outline"
        className="w-full"
        onClick={() => {/* TODO: Implement social auth */}}
      >
        Continue with Google
      </AuthButton>
      <AuthButton
        variant="outline"
        className="w-full"
        onClick={() => {/* TODO: Implement social auth */}}
      >
        Continue with GitHub
      </AuthButton>
    </div>
  );
}
