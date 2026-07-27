import { Map, TriangleAlert, UserCheck, Users } from 'lucide-react'
import Card from '../../../components/ui/Card'
import Skeleton from '../../../components/ui/Skeleton'
import StateMessage from '../../../components/ui/StateMessage'
import { formatNumber } from '../../../lib/format'
import type { ManagerStats } from '../../../types/managers'

interface ManagerStatCardsProps {
  stats: ManagerStats | null
  isLoading: boolean
  error: string | null
}

export default function ManagerStatCards({ stats, isLoading, error }: ManagerStatCardsProps) {
  if (error) {
    return (
      <Card className="p-6">
        <StateMessage variant="error" title="Unable to load manager stats" description={error} />
      </Card>
    )
  }

  if (isLoading || !stats) {
    return (
      <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="p-6">
            <Skeleton className="h-10 w-10 rounded-lg" />
            <Skeleton className="mt-4 h-8 w-20" />
            <Skeleton className="mt-2 h-3 w-28" />
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
      <Card className="p-6 transition-shadow hover:shadow-lg">
        <div className="flex items-start justify-between">
          <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/5 text-primary">
            <Users className="h-5 w-5" />
          </span>
          <span className="rounded-full bg-accent/10 px-2.5 py-1 text-xs font-bold text-accent">+4%</span>
        </div>
        <p className="mt-4 text-3xl font-bold text-primary">{formatNumber(stats.totalManagers)}</p>
        <p className="mt-1 text-[11px] font-bold uppercase tracking-wider text-muted">TOTAL MANAGERS</p>
      </Card>

      <Card className="p-6 transition-shadow hover:shadow-lg">
        <div className="flex items-start justify-between">
          <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-warning/10 text-[#9A6B00]">
            <UserCheck className="h-5 w-5" />
          </span>
          <span className="text-xs font-bold text-primary">Active</span>
        </div>
        <p className="mt-4 text-3xl font-bold text-primary">{formatNumber(stats.currentlyOnline)}</p>
        <p className="mt-1 text-[11px] font-bold uppercase tracking-wider text-muted">CURRENTLY ONLINE</p>
      </Card>

      <Card className="p-6 transition-shadow hover:shadow-lg">
        <div className="flex items-start justify-between">
          <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/5 text-primary">
            <Map className="h-5 w-5" />
          </span>
        </div>
        <p className="mt-4 text-3xl font-bold text-primary">{formatNumber(stats.activeRegions)}</p>
        <p className="mt-1 text-[11px] font-bold uppercase tracking-wider text-muted">ACTIVE REGIONS</p>
      </Card>

      <Card className="p-6 transition-shadow hover:shadow-lg">
        <div className="flex items-start justify-between">
          <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-danger/10 text-danger">
            <TriangleAlert className="h-5 w-5" />
          </span>
        </div>
        <p className="mt-4 text-3xl font-bold text-danger">{formatNumber(stats.pendingApproval)}</p>
        <p className="mt-1 text-[11px] font-bold uppercase tracking-wider text-muted">PENDING APPROVAL</p>
      </Card>
    </div>
  )
}
