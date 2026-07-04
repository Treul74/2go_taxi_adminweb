import { AlertTriangle, Inbox } from 'lucide-react'

interface StateMessageProps {
  variant: 'empty' | 'error'
  title: string
  description?: string
}

export default function StateMessage({ variant, title, description }: StateMessageProps) {
  const Icon = variant === 'error' ? AlertTriangle : Inbox

  return (
    <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
      <Icon className={variant === 'error' ? 'h-6 w-6 text-danger' : 'h-6 w-6 text-muted'} />
      <p className="text-sm font-semibold text-primary">{title}</p>
      {description && <p className="text-xs text-muted">{description}</p>}
    </div>
  )
}
