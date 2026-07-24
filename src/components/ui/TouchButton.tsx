import type { ButtonHTMLAttributes, ReactNode } from 'react'

interface TouchButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  variant?: 'primary' | 'secondary' | 'ghost'
}

export function TouchButton({ children, className = '', variant = 'primary', ...props }: TouchButtonProps) {
  return (
    <button
      className={`touch-button touch-button--${variant} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
