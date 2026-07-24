import { ChevronDown, ChevronRight, ChevronUp } from 'lucide-react'
import Avatar from '../../../components/ui/Avatar'
import Skeleton from '../../../components/ui/Skeleton'
import StateMessage from '../../../components/ui/StateMessage'
import { formatCurrency, formatDate } from '../../../lib/format'
import { OrderStatusBadge } from './OrderStatusBadge'
import type { OrderListRow, SortDirection } from '../../../types/orders'

interface OrdersTableProps {
  rows: OrderListRow[]
  isLoading: boolean
  error: string | null
  sortDirection: SortDirection
  onSort: () => void
  onSelect: (orderId: string) => void
}

const VEHICLE_TYPE_LABEL: Record<string, string> = {
  economy: 'Economy',
  comfort: 'Comfort',
  bike: 'Bike',
  tricycle: 'Tricycle',
  truck: 'Truck',
}

export default function OrdersTable({ rows, isLoading, error, sortDirection, onSort, onSelect }: OrdersTableProps) {
  if (error) {
    return <StateMessage variant="error" title="Unable to load orders" description={error} />
  }

  if (isLoading) {
    return (
      <div className="flex flex-col gap-3 py-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-14 w-full" />
        ))}
      </div>
    )
  }

  if (rows.length === 0) {
    return <StateMessage variant="empty" title="No orders found" description="Try adjusting your filters or search." />
  }

  return (
    <table className="w-full text-left text-sm">
      <thead>
        <tr className="border-b border-gray-100">
          <th className="pb-3 pr-4">
            <button
              type="button"
              onClick={onSort}
              className="flex items-center gap-1 border-0 bg-transparent p-0 text-xs font-semibold uppercase tracking-wide text-muted hover:text-primary"
            >
              Order ID
              {sortDirection === 'asc' ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            </button>
          </th>
          <th className="pb-3 pr-4 text-xs font-semibold uppercase tracking-wide text-muted">Customer</th>
          <th className="pb-3 pr-4 text-xs font-semibold uppercase tracking-wide text-muted">Driver</th>
          <th className="pb-3 pr-4 text-xs font-semibold uppercase tracking-wide text-muted">Vehicle</th>
          <th className="pb-3 pr-4 text-xs font-semibold uppercase tracking-wide text-muted">Fare</th>
          <th className="pb-3 pr-4 text-xs font-semibold uppercase tracking-wide text-muted">Status</th>
          <th className="pb-3 pr-4 text-xs font-semibold uppercase tracking-wide text-muted">Date</th>
          <th className="pb-3 pr-4 text-xs font-semibold uppercase tracking-wide text-muted">Actions</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr
            key={row.id}
            onClick={() => onSelect(row.id)}
            className="cursor-pointer border-b border-gray-50 transition hover:bg-gray-50"
          >
            <td className="py-3 pr-4 font-bold text-primary">#ORD-{row.orderNumber}</td>
            <td className="py-3 pr-4">
              <div className="flex items-center gap-2.5">
                <Avatar name={row.customerName} photoUrl={row.customerPhotoUrl} size={32} />
                <span className="font-medium text-primary">{row.customerName}</span>
              </div>
            </td>
            <td className="py-3 pr-4">
              {row.driverName ? (
                <div className="flex items-center gap-2.5">
                  <Avatar name={row.driverName} photoUrl={row.driverPhotoUrl} size={32} />
                  <span className="font-medium text-primary">{row.driverName}</span>
                </div>
              ) : (
                <span className="italic text-muted">Unassigned</span>
              )}
            </td>
            <td className="py-3 pr-4 text-primary">
              {row.vehicleMake && row.vehicleModel
                ? `${row.vehicleMake} ${row.vehicleModel}`
                : (row.vehicleType && VEHICLE_TYPE_LABEL[row.vehicleType]) ?? '—'}
            </td>
            <td className="py-3 pr-4 font-bold text-primary">{formatCurrency(row.fareAmount)}</td>
            <td className="py-3 pr-4">
              <OrderStatusBadge status={row.status} />
            </td>
            <td className="py-3 pr-4 text-muted">{formatDate(row.createdAt)}</td>
            <td className="py-3 pr-4 text-right">
              <ChevronRight className="ml-auto h-4 w-4 text-muted" />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
