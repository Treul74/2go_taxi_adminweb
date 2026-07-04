import { Download, Search } from 'lucide-react'
import { useState } from 'react'
import AdminLayout from '../../components/layout/AdminLayout'
import Card from '../../components/ui/Card'
import DateRangeFilter from '../../components/ui/DateRangeFilter'
import Pagination from '../../components/ui/Pagination'
import Tabs from '../../components/ui/Tabs'
import { downloadCsv } from '../../lib/csv'
import { fetchOrdersForExport } from '../../lib/orders'
import type { OrderTab } from '../../types/orders'
import OrderDetailPanel from './components/OrderDetailPanel'
import OrdersTable from './components/OrdersTable'
import { useOrders } from './hooks/useOrders'

const TAB_ITEMS: { value: OrderTab; label: string }[] = [
  { value: 'active', label: 'Active Orders' },
  { value: 'pending', label: 'Pending Requests' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'history', label: 'History' },
]

const VEHICLE_CLASS_OPTIONS = [
  { value: 'all', label: 'All Vehicle Types' },
  { value: 'economy', label: 'Economy' },
  { value: 'suv', label: 'SUV' },
  { value: 'luxury', label: 'Luxury' },
  { value: 'sprinter', label: 'Sprinter' },
] as const

export default function Orders() {
  const orders = useOrders()
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null)
  const [isExporting, setIsExporting] = useState(false)

  async function handleExport() {
    setIsExporting(true)
    try {
      const rows = await fetchOrdersForExport({
        tab: orders.tab,
        search: orders.searchInput,
        dateFrom: orders.dateFrom,
        dateTo: orders.dateTo,
      })
      downloadCsv(
        `orders-${orders.tab}-${new Date().toISOString().slice(0, 10)}.csv`,
        ['Order ID', 'Customer', 'Driver', 'Vehicle Type', 'Fare', 'Status', 'Date'],
        rows.map((row) => [
          `#ORD-${row.orderNumber}`,
          row.customerName,
          row.driverName ?? 'Unassigned',
          row.vehicleClass ?? '',
          row.fareAmount.toFixed(2),
          row.status,
          row.createdAt,
        ]),
      )
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <AdminLayout>
      <div className="flex flex-col gap-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-primary">Orders</h1>
            <p className="text-sm text-muted">Manage and monitor all vehicle bookings across your fleet.</p>
          </div>

          <div className="flex items-center gap-3">
            <DateRangeFilter from={orders.dateFrom} to={orders.dateTo} onChange={orders.setDateRange} />
            <button
              type="button"
              onClick={() => void handleExport()}
              disabled={isExporting}
              className="flex items-center gap-2 rounded-button border-0 bg-primary px-4 py-2.5 text-sm font-bold text-white transition hover:brightness-110 disabled:opacity-60"
            >
              <Download className="h-4 w-4" />
              {isExporting ? 'Exporting…' : 'Export CSV'}
            </button>
          </div>
        </div>

        <Card className="p-6">
          <Tabs items={TAB_ITEMS} value={orders.tab} onChange={orders.setTab} />

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <div className="relative max-w-xs flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
              <input
                type="search"
                value={orders.searchInput}
                onChange={(e) => orders.setSearchInput(e.target.value)}
                placeholder="Search order #, pickup, or drop-off…"
                className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-4 text-sm text-primary placeholder:text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
              />
            </div>

            <select
              value={orders.vehicleClass}
              onChange={(e) => orders.setVehicleClass(e.target.value as typeof orders.vehicleClass)}
              className="rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm font-medium text-primary focus:border-accent focus:outline-none"
            >
              {VEHICLE_CLASS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="mt-4 overflow-x-auto">
            <OrdersTable
              rows={orders.rows}
              isLoading={orders.isLoading}
              error={orders.error}
              sortBy={orders.sortBy}
              sortDirection={orders.sortDirection}
              onSort={orders.toggleSort}
              onSelect={setSelectedOrderId}
            />
          </div>

          {!orders.isLoading && !orders.error && orders.total > 0 && (
            <div className="mt-4">
              <Pagination page={orders.page} pageSize={orders.pageSize} total={orders.total} onPageChange={orders.setPage} />
            </div>
          )}
        </Card>
      </div>

      <OrderDetailPanel orderId={selectedOrderId} onClose={() => setSelectedOrderId(null)} />
    </AdminLayout>
  )
}
