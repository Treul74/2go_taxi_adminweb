import type { OrderStatus } from '../../../types/orders'

const STATUS_STYLE: Record<OrderStatus, string> = {
  pending: 'bg-warning/10 text-[#9A6B00]',
  accepted: 'bg-sky-100 text-sky-600',
  in_progress: 'bg-sky-100 text-sky-600',
  completed: 'bg-success/10 text-success',
  cancelled: 'bg-danger/10 text-danger',
  expired: 'bg-muted/10 text-muted',
}

const STATUS_LABEL: Record<OrderStatus, string> = {
  pending: 'Pending',
  accepted: 'Active',
  in_progress: 'Active',
  completed: 'Completed',
  cancelled: 'Cancelled',
  expired: 'Expired',
}

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold uppercase tracking-wide ${STATUS_STYLE[status]}`}
    >
      {STATUS_LABEL[status]}
    </span>
  )
}
