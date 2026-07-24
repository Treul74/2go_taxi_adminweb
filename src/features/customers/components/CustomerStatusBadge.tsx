import Badge, { type BadgeTone } from '../../../components/ui/Badge'
import type { CustomerAccountStatus } from '../../../types/customers'

const STATUS_TONE: Record<CustomerAccountStatus, BadgeTone> = {
  active: 'success',
  suspended: 'danger',
  pending: 'warning',
  deleted: 'neutral',
}

const STATUS_LABEL: Record<CustomerAccountStatus, string> = {
  active: 'Active',
  suspended: 'Suspended',
  pending: 'Pending',
  deleted: 'Deleted',
}

export function CustomerStatusBadge({ status }: { status: CustomerAccountStatus }) {
  return <Badge tone={STATUS_TONE[status]}>{STATUS_LABEL[status]}</Badge>
}
