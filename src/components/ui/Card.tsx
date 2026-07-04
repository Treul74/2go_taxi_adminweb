import type { HTMLAttributes } from 'react'

export default function Card({ className = '', children, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`rounded-card bg-card shadow-sm ${className}`} {...rest}>
      {children}
    </div>
  )
}
