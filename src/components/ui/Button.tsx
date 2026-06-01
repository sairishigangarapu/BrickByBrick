"use client";

import React from 'react';
import { cn } from '@/lib/utils';

const variantClasses = {
  default: 'bg-brand-primary text-white hover:bg-orange-700',
  primary: 'bg-brand-primary text-white hover:bg-orange-700',
  secondary: 'bg-foreground text-white hover:bg-gray-800',
  outline: 'border border-border bg-transparent hover:bg-brand-surface text-foreground',
  ghost: 'bg-transparent hover:bg-brand-surface text-foreground',
} as const;

const sizeClasses = {
  sm: 'h-8 px-3 text-xs',
  md: 'h-10 px-4 py-2',
  lg: 'h-12 px-8 text-lg',
} as const;

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof variantClasses;
  size?: keyof typeof sizeClasses;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'md', ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand-primary disabled:pointer-events-none disabled:opacity-50",
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      {...props}
    />
  )
);

Button.displayName = "Button";
