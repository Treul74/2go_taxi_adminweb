import { Download, Search, SlidersHorizontal } from 'lucide-react'
import { useRef, useState } from 'react'
import AdminLayout from '../../components/layout/AdminLayout'
import Card from '../../components/ui/Card'
import Pagination from '../../components/ui/Pagination'
import Tabs from '../../components/ui/Tabs'
import { downloadCsv } from '../../lib/csv'
import { fetchOrdersForExport } from '../../lib/orders'
import type { OrderFilters, OrderTab } from '../../types/orders'
import OrderDetailPanel from './components/OrderDetailPanel'
import OrdersTable from './components/OrdersTable'
import { useOrders } from './hooks/useOrders'

const TAB_ITEMS: { value: OrderTab; label: string }[] = [
  { value: 'all', label: 'All Orders' },
  { value: 'pending', label: 'Pending' },
  { value: 'active', label: 'Active' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'history', label: 'History' },
]

const VEHICLE_TYPE_OPTIONS: { value: OrderFilters['vehicleType']; label: string }[] = [
  { value: 'all', label: 'All Vehicle Types' },
  { value: 'economy', label: 'Economy' },
  { value: 'comfort', label: 'Comfort' },
  { value: 'bike', label: 'Bike' },
  { value: 'tricycle', label: 'Tricycle' },
  { value: 'truck', label: 'Truck' },
]

function toInputValue(date: Date | null) {
  if (!date) return ''
  return date.toISOString().slice(0, 10)
}

export default function Orders() {
  const orders = useOrders()
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null)
  const [isExporting, setIsExporting] = useState(false)
  const [filtersOpen, setFiltersOpen] = useState(false)
  const filtersRef = useRef<HTMLDivElement>(null)

  const hasActiveFilters = orders.vehicleType !== 'all' || orders.dateFrom !== null || orders.dateTo !== null

  async function handleExport() {
    setIsExporting(true)
    try {
      const rows = await fetchOrdersForExport({
        tab: orders.tab,
        search: orders.searchInput,
        vehicleType: orders.vehicleType,
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
          row.vehicleType ?? '',
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
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-primary">Order Management</h1>
            <p className="text-sm text-muted">Real-time oversight of all platform transactions and ride fulfillment.</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative" ref={filtersRef}>
              <button
                type="button"
                onClick={() => setFiltersOpen((prev) => !prev)}
                className="flex items-center gap-2 rounded-button border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-primary transition hover:bg-gray-50"
              >
                <SlidersHorizontal className="h-4 w-4" />
                Advanced Filters
                {hasActiveFilters && <span className="h-2 w-2 rounded-full bg-accent" />}
              </button>

              {filtersOpen && (
                <div className="absolute right-0 z-20 mt-2 w-72 rounded-card border border-gray-100 bg-card p-4 shadow-xl">
                  <div className="flex flex-col gap-3">
                    <label className="text-xs font-semibold text-muted">
                      Vehicle Type
                      <select
                        value={orders.vehicleType}
                        onChange={(e) => orders.setVehicleType(e.target.value as OrderFilters['vehicleType'])}
                        className="mt-1 block w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-primary focus:border-accent focus:outline-none"
                      >
                        {VEHICLE_TYPE_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="text-xs font-semibold text-muted">
                      From
                      <input
                        type="date"
                        value={toInputValue(orders.dateFrom)}
                        onChange={(e) => orders.setDateRange(e.target.value ? new Date(e.target.value) : null, orders.dateTo)}
                        className="mt-1 block w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-primary focus:border-accent focus:outline-none"
                      />
                    </label>
                    <label className="text-xs font-semibold text-muted">
                      To
                      <input
                        type="date"
                        value={toInputValue(orders.dateTo)}
                        onChange={(e) => orders.setDateRange(orders.dateFrom, e.target.value ? new Date(e.target.value) : null)}
                        className="mt-1 block w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-primary focus:border-accent focus:outline-none"
                      />
                    </label>
                  </div>

                  <div className="mt-4 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        orders.setVehicleType('all')
                        orders.setDateRange(null, null)
                      }}
                      className="rounded-button border-0 bg-gray-100 px-3 py-2 text-xs font-semibold text-primary hover:bg-gray-200"
                    >
                      Clear
                    </button>
                    <button
                      type="button"
                      onClick={() => setFiltersOpen(false)}
                      className="rounded-button border-0 bg-primary px-4 py-2 text-xs font-bold text-white"
                    >
                      Apply
                    </button>
                  </div>
                </div>
              )}
            </div>

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
                placeholder="Search orders, customers, or IDs…"
                className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-4 text-sm text-primary placeholder:text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
              />
            </div>
          </div>

          <div className="mt-4 overflow-x-auto">
            <OrdersTable
              rows={orders.rows}
              isLoading={orders.isLoading}
              error={orders.error}
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
