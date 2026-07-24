import { CheckCircle2, LayoutGrid, Users } from 'lucide-react'
import Card from '../../../components/ui/Card'
import Skeleton from '../../../components/ui/Skeleton'
import StateMessage from '../../../components/ui/StateMessage'
import { formatNumber } from '../../../lib/format'
import type { VehicleClassStats } from '../../../types/vehicleClasses'

interface VehicleClassStatCardsProps {
  stats: VehicleClassStats | null
  isLoading: boolean
  error: string | null
}

export default function VehicleClassStatCards({ stats, isLoading, error }: VehicleClassStatCardsProps) {
  if (error) {
    return (
      <Card className="p-6">
        <StateMessage variant="error" title="Unable to load vehicle class stats" description={error} />
      </Card>
    )
  }

  if (isLoading || !stats) {
    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="p-5">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="mt-4 h-8 w-16" />
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      <Card className="p-5">
        <div className="flex items-center gap-4">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-primary">
            <LayoutGrid className="h-5 w-5" />
          </span>
          <div>
            <p className="text-sm text-muted">Total Classes</p>
            <p className="text-2xl font-bold text-primary">{formatNumber(stats.totalClasses)}</p>
          </div>
        </div>
        {stats.newThisMonth > 0 && (
          <p className="mt-2 text-xs font-medium text-success">+{stats.newThisMonth} this month</p>
        )}
      </Card>

      <Card className="p-5">
        <div className="flex items-center gap-4">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-success/10 text-success">
            <CheckCircle2 className="h-5 w-5" />
          </span>
          <div>
            <p className="text-sm text-muted">Active Tiers</p>
            <div className="flex items-baseline gap-2">
              <p className="text-2xl font-bold text-primary">{formatNumber(stats.activeTiers)}</p>
              <span className="rounded-full bg-success/10 px-2 py-0.5 text-xs font-semibold text-success">
                {stats.utilizationPct.toFixed(0)}% Utilization
              </span>
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-5">
        <div className="flex items-center gap-4">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-sky-100 text-sky-600">
            <Users className="h-5 w-5" />
          </span>
          <div>
            <p className="text-sm text-muted">Avg. Capacity</p>
            <p className="text-2xl font-bold text-primary">{stats.avgCapacity.toFixed(1)} Pax</p>
          </div>
        </div>
      </Card>
    </div>
  )
}
