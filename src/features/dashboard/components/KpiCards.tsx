import { Car, ClipboardList, DollarSign, ShoppingBag, UserCheck, Users } from 'lucide-react'
import type { ComponentType } from 'react'
import Card from '../../../components/ui/Card'
import Skeleton from '../../../components/ui/Skeleton'
import StateMessage from '../../../components/ui/StateMessage'
import { formatCompactCurrency, formatNumber, formatPct } from '../../../lib/format'
import type { DashboardStats } from '../../../types/dashboard'

interface KpiCardsProps {
  stats: DashboardStats | null
  isLoading: boolean
  error: string | null
}

interface KpiDefinition {
  label: string
  icon: ComponentType<{ className?: string }>
  iconClass: string
  value: string
  subtitle: string
  subtitleClass?: string
}

export default function KpiCards({ stats, isLoading, error }: KpiCardsProps) {
  if (error) {
    return (
      <Card className="p-6">
        <StateMessage variant="error" title="Unable to load dashboard stats" description={error} />
      </Card>
    )
  }

  if (isLoading || !stats) {
    return (
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="p-5">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="mt-4 h-8 w-16" />
            <Skeleton className="mt-3 h-3 w-20" />
          </Card>
        ))}
      </div>
    )
  }

  const cards: KpiDefinition[] = [
    {
      label: 'Total Customers',
      icon: Users,
      iconClass: 'bg-primary/10 text-primary',
      value: formatNumber(stats.totalCustomers),
      subtitle:
        stats.customerGrowthPct === null
          ? 'from last month'
          : `${formatPct(stats.customerGrowthPct)} from last month`,
    },
    {
      label: 'Total Orders',
      icon: ShoppingBag,
      iconClass: 'bg-accent/10 text-accent',
      value: formatNumber(stats.totalOrders),
      subtitle: stats.orderGrowthPct === null ? 'no change' : `${formatPct(stats.orderGrowthPct)} increase`,
      subtitleClass: stats.orderGrowthPct !== null && stats.orderGrowthPct >= 0 ? 'text-success' : 'text-danger',
    },
    {
      label: 'Active Orders',
      icon: ClipboardList,
      iconClass: 'bg-sky-100 text-sky-600',
      value: formatNumber(stats.activeOrders),
      subtitle: 'Currently in-progress',
    },
    {
      label: 'Total Drivers',
      icon: Car,
      iconClass: 'bg-primary/10 text-primary',
      value: formatNumber(stats.totalDrivers),
      subtitle: `${formatNumber(stats.activeDriversNow)} Active currently`,
    },
    {
      label: 'Total Revenue',
      icon: DollarSign,
      iconClass: 'bg-success/10 text-success',
      value: formatCompactCurrency(stats.totalRevenueThisMonth),
      subtitle: 'Gross this month',
    },
    {
      label: 'Pending',
      icon: UserCheck,
      iconClass: 'bg-danger/10 text-danger',
      value: formatNumber(stats.pendingApprovals),
      subtitle: 'Requires attention',
      subtitleClass: 'text-danger',
    },
  ]

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
      {cards.map((card) => (
        <Card key={card.label} className="p-5">
          <div className="flex items-start justify-between">
            <p className="text-sm font-medium text-muted">{card.label}</p>
            <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${card.iconClass}`}>
              <card.icon className="h-4 w-4" />
            </span>
          </div>
          <p className="mt-3 text-2xl font-bold text-primary">{card.value}</p>
          <p className={`mt-1 text-xs font-medium ${card.subtitleClass ?? 'text-muted'}`}>{card.subtitle}</p>
        </Card>
      ))}
    </div>
  )
}
