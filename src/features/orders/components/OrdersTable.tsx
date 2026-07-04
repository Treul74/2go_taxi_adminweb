import { ChevronRight } from 'lucide-react'
import Avatar from '../../../components/ui/Avatar'
import Skeleton from '../../../components/ui/Skeleton'
import StateMessage from '../../../components/ui/StateMessage'
import { formatCurrency, formatDate } from '../../../lib/format'
import { OrderStatusBadge } from './OrderStatusBadge'
import type { OrderListRow, OrderSortColumn, SortDirection } from '../../../types/orders'

interface OrdersTableProps {
  rows: OrderListRow[]
  isLoading: boolean
  error: string | null
  sortBy: OrderSortColumn
  sortDirection: SortDirection
  onSort: (column: OrderSortColumn) => void
  onSelect: (orderId: string) => void
}

const VEHICLE_CLASS_LABEL: Record<string, string> = {
  economy: 'Economy',
  suv: 'SUV',
  luxury: 'Luxury',
  sprinter: 'Sprinter',
}

function SortHeader({
  label,
  column,
  sortBy,
  sortDirection,
  onSort,
}: {
  label: string
  column: OrderSortColumn
  sortBy: OrderSortColumn
  sortDirection: SortDirection
  onSort: (column: OrderSortColumn) => void
}) {
  const isActive = sortBy === column
  return (
    <button
      type="button"
      onClick={() => onSort(column)}
      className="flex items-center gap-1 border-0 bg-transparent p-0 text-xs font-semibold uppercase tracking-wide text-muted hover:text-primary"
    >
      {label}
      <span className={isActive ? 'text-primary' : 'text-gray-300'}>
        {isActive && sortDirection === 'asc' ? '↑' : '↓'}
      </span>
    </button>
  )
}

export default function OrdersTable({ rows, isLoading, error, sortBy, sortDirection, onSort, onSelect }: OrdersTableProps) {
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
    return <StateMessage variant="empty" title="No orders found" description="Try adjusting your filters or date range." />
  }

  return (
    <table className="w-full text-left text-sm">
      <thead>
        <tr className="border-b border-gray-100">
          <th className="pb-3 pr-4 text-xs font-semibold uppercase tracking-wide text-muted">Order ID</th>
          <th className="pb-3 pr-4 text-xs font-semibold uppercase tracking-wide text-muted">Customer</th>
          <th className="pb-3 pr-4 text-xs font-semibold uppercase tracking-wide text-muted">Driver</th>
          <th className="pb-3 pr-4 text-xs font-semibold uppercase tracking-wide text-muted">Vehicle Type</th>
          <th className="pb-3 pr-4">
            <SortHeader label="Fare" column="fare_amount" sortBy={sortBy} sortDirection={sortDirection} onSort={onSort} />
          </th>
          <th className="pb-3 pr-4 text-xs font-semibold uppercase tracking-wide text-muted">Status</th>
          <th className="pb-3 pr-4">
            <SortHeader label="Date" column="created_at" sortBy={sortBy} sortDirection={sortDirection} onSort={onSort} />
          </th>
          <th className="pb-3" />
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
            <td className="py-3 pr-4 text-muted">{row.driverName ?? 'Unassigned'}</td>
            <td className="py-3 pr-4">
              {row.vehicleClass && (
                <span className="rounded bg-gray-100 px-2 py-1 text-xs font-semibold uppercase tracking-wide text-primary">
                  {VEHICLE_CLASS_LABEL[row.vehicleClass] ?? row.vehicleClass}
                </span>
              )}
            </td>
            <td className="py-3 pr-4 font-bold text-primary">{formatCurrency(row.fareAmount)}</td>
            <td className="py-3 pr-4">
              <OrderStatusBadge status={row.status} />
            </td>
            <td className="py-3 pr-4 text-muted">{formatDate(row.createdAt)}</td>
            <td className="py-3 text-right">
              <ChevronRight className="ml-auto h-4 w-4 text-muted" />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
