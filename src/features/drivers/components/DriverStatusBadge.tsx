import Badge, { type BadgeTone } from '../../../components/ui/Badge'
import type { DriverAccountStatus } from '../../../types/drivers'

const STATUS_TONE: Record<DriverAccountStatus, BadgeTone> = {
  approved: 'success',
  pending: 'warning',
  suspended: 'danger',
  rejected: 'danger',
  inactive: 'neutral',
}

const STATUS_LABEL: Record<DriverAccountStatus, string> = {
  approved: 'Active',
  pending: 'Pending',
  suspended: 'Suspended',
  rejected: 'Rejected',
  inactive: 'Inactive',
}

export function DriverStatusBadge({ status }: { status: DriverAccountStatus }) {
  return <Badge tone={STATUS_TONE[status]}>{STATUS_LABEL[status]}</Badge>
}
