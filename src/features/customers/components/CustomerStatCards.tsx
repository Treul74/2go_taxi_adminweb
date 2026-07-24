import { CheckCircle2, History, Trash2, TriangleAlert, Users } from 'lucide-react'
import Card from '../../../components/ui/Card'
import Skeleton from '../../../components/ui/Skeleton'
import StateMessage from '../../../components/ui/StateMessage'
import { formatNumber } from '../../../lib/format'
import type { CustomerStats } from '../../../types/customers'

interface CustomerStatCardsProps {
  stats: CustomerStats | null
  isLoading: boolean
  error: string | null
}

export default function CustomerStatCards({ stats, isLoading, error }: CustomerStatCardsProps) {
  if (error) {
    return (
      <Card className="p-6">
        <StateMessage variant="error" title="Unable to load customer stats" description={error} />
      </Card>
    )
  }

  if (isLoading || !stats) {
    return (
      <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="p-6">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="mt-3 h-8 w-20" />
            <Skeleton className="mt-4 h-3 w-28" />
          </Card>
        ))}
      </div>
    )
  }

  const participationPct = stats.total === 0 ? 0 : (stats.active / stats.total) * 100

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
      <Card className="p-6 transition-shadow hover:shadow-lg">
        <div className="flex items-start justify-between">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted">Total Customers</p>
          <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/5 text-primary">
            <Users className="h-5 w-5" />
          </span>
        </div>
        <p className="mt-2 text-3xl font-bold text-primary">{formatNumber(stats.total)}</p>
        <p className="mt-4 text-xs font-medium text-muted">All registered accounts</p>
      </Card>

      <Card className="p-6 transition-shadow hover:shadow-lg">
        <div className="flex items-start justify-between">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted">Active</p>
          <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-success/10 text-success">
            <CheckCircle2 className="h-5 w-5" />
          </span>
        </div>
        <p className="mt-2 text-3xl font-bold text-success">{formatNumber(stats.active)}</p>
        <p className="mt-4 text-xs font-medium text-success">{participationPct.toFixed(1)}% participation rate</p>
      </Card>

      <Card className="p-6 transition-shadow hover:shadow-lg">
        <div className="flex items-start justify-between">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted">Suspended</p>
          <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-danger/10 text-danger">
            <TriangleAlert className="h-5 w-5" />
          </span>
        </div>
        <p className="mt-2 text-3xl font-bold text-danger">{formatNumber(stats.suspended)}</p>
        <p className="mt-4 text-xs font-medium text-danger">Requires review</p>
      </Card>

      <Card className="p-6 transition-shadow hover:shadow-lg">
        <div className="flex items-start justify-between">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted">Deleted</p>
          <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-gray-100 text-muted">
            <Trash2 className="h-5 w-5" />
          </span>
        </div>
        <p className="mt-2 text-3xl font-bold text-muted">{formatNumber(stats.deleted)}</p>
        <p className="mt-4 flex items-center gap-1 text-xs font-medium text-muted">
          <History className="h-3.5 w-3.5" />
          Legacy data accounts
        </p>
      </Card>
    </div>
  )
}
