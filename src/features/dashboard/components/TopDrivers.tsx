import { Star } from 'lucide-react'
import Avatar from '../../../components/ui/Avatar'
import Badge from '../../../components/ui/Badge'
import Card from '../../../components/ui/Card'
import Skeleton from '../../../components/ui/Skeleton'
import StateMessage from '../../../components/ui/StateMessage'
import { formatCurrency } from '../../../lib/format'
import type { DriverLiveStatus, TopDriverRow } from '../../../types/dashboard'

interface TopDriversProps {
  drivers: TopDriverRow[]
  isLoading: boolean
  error: string | null
}

const STATUS_TONE: Record<DriverLiveStatus, 'success' | 'warning' | 'neutral'> = {
  active: 'success',
  idle: 'warning',
  offline: 'neutral',
}

export default function TopDrivers({ drivers, isLoading, error }: TopDriversProps) {
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-primary">Top Drivers</h2>
        <button type="button" className="border-0 bg-transparent text-sm font-semibold text-accent">
          View All
        </button>
      </div>

      {error ? (
        <StateMessage variant="error" title="Unable to load top drivers" description={error} />
      ) : isLoading ? (
        <div className="mt-4 flex flex-col gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : drivers.length === 0 ? (
        <StateMessage variant="empty" title="No drivers yet" description="Approved drivers with completed rides will show up here." />
      ) : (
        <table className="mt-4 w-full text-left text-sm">
          <thead>
            <tr className="text-xs font-semibold uppercase tracking-wide text-muted">
              <th className="pb-3 font-semibold">Driver</th>
              <th className="pb-3 font-semibold">Vehicle</th>
              <th className="pb-3 font-semibold">Rating</th>
              <th className="pb-3 font-semibold">Earnings</th>
              <th className="pb-3 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody>
            {drivers.map((driver) => (
              <tr key={driver.id} className="border-t border-gray-100">
                <td className="py-3">
                  <div className="flex items-center gap-3">
                    <Avatar name={`${driver.firstName} ${driver.lastName}`} photoUrl={driver.profilePhotoUrl} size={36} />
                    <span className="font-semibold text-primary">
                      {driver.firstName} {driver.lastName}
                    </span>
                  </div>
                </td>
                <td className="py-3 text-muted">
                  {[driver.vehicleMake, driver.vehicleModel].filter(Boolean).join(' ') || '—'}
                  {driver.vehicleYear ? ` (${driver.vehicleYear})` : ''}
                </td>
                <td className="py-3">
                  <span className="flex items-center gap-1 font-semibold text-primary">
                    <Star className="h-3.5 w-3.5 fill-warning text-warning" />
                    {driver.rating.toFixed(1)}
                  </span>
                </td>
                <td className="py-3 font-semibold text-primary">{formatCurrency(driver.totalEarnings)}</td>
                <td className="py-3">
                  <Badge tone={STATUS_TONE[driver.driverStatus]}>{driver.driverStatus}</Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </Card>
  )
}
