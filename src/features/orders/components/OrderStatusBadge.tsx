import Badge, { type BadgeTone } from '../../../components/ui/Badge'
import type { OrderStatus } from '../../../types/orders'

const STATUS_TONE: Record<OrderStatus, BadgeTone> = {
  pending: 'warning',
  accepted: 'info',
  in_progress: 'info',
  completed: 'success',
  cancelled: 'danger',
}

const STATUS_LABEL: Record<OrderStatus, string> = {
  pending: 'Pending',
  accepted: 'Accepted',
  in_progress: 'In Progress',
  completed: 'Completed',
  cancelled: 'Cancelled',
}

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return <Badge tone={STATUS_TONE[status]}>{STATUS_LABEL[status]}</Badge>
}
