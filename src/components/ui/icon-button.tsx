import type { ComponentPropsWithoutRef } from 'react';
import { forwardRef } from 'react';

import { cn } from '@/lib/utils';

export interface IconButtonProps extends ComponentPropsWithoutRef<'button'> {
  /**
   * The variant of the button
   */
  variant?: 'default' | 'primary' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';

  /**
   * The size of the button
   */
  size?: 'default' | 'sm' | 'lg' | 'icon';

  label?: string;
  icon?: string;
}

/**
 * IconButton component for showing buttons with only icons
 */
export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ className, variant = 'default', size = 'icon', label, icon, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none';
    
    // Variant styles
    const variantStyles = {
      default: 'bg-primary text-primary-foreground hover:bg-primary/90',
      primary: 'bg-primary text-primary-foreground hover:bg-primary/90',
      destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
      outline: 'border border-input hover:bg-accent hover:text-accent-foreground',
      secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
      ghost: 'hover:bg-accent hover:text-accent-foreground',
      link: 'underline-offset-4 hover:underline text-primary',
    };
    
    // Size styles
    const sizeStyles = {
      default: 'h-10 py-2 px-4',
      sm: 'h-9 px-3 rounded-md',
      lg: 'h-11 px-8 rounded-md',
      icon: 'h-10 w-10',
    };
    
    return (
      <button
        className={cn(
          baseStyles,
          // Handle default variant
          variant === 'default' ? variantStyles.default : variantStyles[variant],
          // Handle default size
          size === 'default' ? sizeStyles.default : sizeStyles[size],
          className
        )}
        ref={ref}
        {...props}
      >
        {label && <span className="sr-only">{label}</span>}
        {icon && (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="h-5 w-5"
          >
            <path d={icon} />
          </svg>
        )}
        {props.children}
      </button>
    );
  }
);

IconButton.displayName = 'IconButton'; 