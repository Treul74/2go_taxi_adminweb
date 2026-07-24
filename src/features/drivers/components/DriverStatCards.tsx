import { Star, TriangleAlert, UserCheck, Users } from 'lucide-react'
import Badge from '../../../components/ui/Badge'
import Card from '../../../components/ui/Card'
import Skeleton from '../../../components/ui/Skeleton'
import StateMessage from '../../../components/ui/StateMessage'
import { formatNumber } from '../../../lib/format'
import type { DriverStats } from '../../../types/drivers'

interface DriverStatCardsProps {
  stats: DriverStats | null
  isLoading: boolean
  error: string | null
}

export default function DriverStatCards({ stats, isLoading, error }: DriverStatCardsProps) {
  if (error) {
    return (
      <Card className="p-6">
        <StateMessage variant="error" title="Unable to load driver stats" description={error} />
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

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
      <Card className="p-6 transition-shadow hover:shadow-lg">
        <div className="flex items-start justify-between">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted">Total Drivers</p>
          <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/5 text-primary">
            <Users className="h-5 w-5" />
          </span>
        </div>
        <p className="mt-2 text-3xl font-bold text-primary">{formatNumber(stats.total)}</p>
        <p className="mt-4 text-xs font-medium text-muted">Global fleet of verified partners</p>
      </Card>

      <Card className="p-6 transition-shadow hover:shadow-lg">
        <div className="flex items-start justify-between">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted">Active Now</p>
          <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-success/10 text-success">
            <UserCheck className="h-5 w-5" />
          </span>
        </div>
        <p className="mt-2 text-3xl font-bold text-primary">{formatNumber(stats.activeNow)}</p>
        <p className="mt-4 flex items-center gap-1.5 text-xs font-medium text-muted">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
          </span>
          Live tracking
        </p>
      </Card>

      <Card className="p-6 transition-shadow hover:shadow-lg">
        <div className="flex items-start justify-between">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted">Pending Approval</p>
          <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-warning/10 text-[#9A6B00]">
            <TriangleAlert className="h-5 w-5" />
          </span>
        </div>
        <p className="mt-2 text-3xl font-bold text-primary">{formatNumber(stats.pendingApproval)}</p>
        <div className="mt-4">
          <Badge tone="warning">Requires Action</Badge>
        </div>
      </Card>

      <Card className="p-6 transition-shadow hover:shadow-lg">
        <div className="flex items-start justify-between">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted">Fleet Rating</p>
          <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-accent/10 text-accent">
            <Star className="h-5 w-5" />
          </span>
        </div>
        <p className="mt-2 text-3xl font-bold text-primary">{stats.fleetRating.toFixed(1)}</p>
        <p className="mt-4 text-xs font-medium text-muted">Global average</p>
      </Card>
    </div>
  )
}
