import type { ReactNode } from 'react'

export type BadgeTone = 'success' | 'warning' | 'danger' | 'neutral' | 'info'

const TONE_CLASSES: Record<BadgeTone, string> = {
  success: 'bg-success/10 text-success',
  warning: 'bg-warning/10 text-[#9A6B00]',
  danger: 'bg-danger/10 text-danger',
  neutral: 'bg-muted/10 text-muted',
  info: 'bg-sky-100 text-sky-600',
}

interface BadgeProps {
  tone: BadgeTone
  children: ReactNode
}

export default function Badge({ tone, children }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${TONE_CLASSES[tone]}`}
    >
      {children}
    </span>
  )
}
