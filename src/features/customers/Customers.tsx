import { Download, Search, SlidersHorizontal } from 'lucide-react'
import { useState } from 'react'
import AdminLayout from '../../components/layout/AdminLayout'
import Card from '../../components/ui/Card'
import Pagination from '../../components/ui/Pagination'
import { downloadCsv } from '../../lib/csv'
import { fetchCustomersForExport, updateCustomerStatus } from '../../lib/customers'
import type { CustomerAccountStatus, CustomerSortOption } from '../../types/customers'
import CustomerDetailPanel from './components/CustomerDetailPanel'
import CustomerStatCards from './components/CustomerStatCards'
import CustomersTable from './components/CustomersTable'
import { useCustomerStats } from './hooks/useCustomerStats'
import { useCustomers } from './hooks/useCustomers'

const STATUS_OPTIONS: { value: 'all' | CustomerAccountStatus; label: string }[] = [
  { value: 'all', label: 'All Statuses' },
  { value: 'active', label: 'Active' },
  { value: 'suspended', label: 'Suspended' },
  { value: 'pending', label: 'Pending' },
  { value: 'deleted', label: 'Deleted' },
]

const SORT_OPTIONS: { value: CustomerSortOption; label: string }[] = [
  { value: 'recent_activity', label: 'Recent Activity' },
  { value: 'join_date', label: 'Join Date' },
  { value: 'wallet_balance', label: 'Wallet Balance' },
]

export default function Customers() {
  const stats = useCustomerStats()
  const customers = useCustomers()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [detailRefreshToken, setDetailRefreshToken] = useState(0)
  const [showFilters, setShowFilters] = useState(false)
  const [isExporting, setIsExporting] = useState(false)

  async function handleExport() {
    setIsExporting(true)
    try {
      const rows = await fetchCustomersForExport({ search: customers.searchInput, status: customers.status })
      downloadCsv(
        `customers-${new Date().toISOString().slice(0, 10)}.csv`,
        ['Customer ID', 'Name', 'Email', 'Phone', 'Status', 'Wallet Balance', 'Total Rides', 'Joined'],
        rows.map((row) => [
          row.id,
          [row.firstName, row.lastName].filter(Boolean).join(' '),
          row.email ?? '',
          row.phoneNumber ?? '',
          row.accountStatus,
          row.walletBalance.toFixed(2),
          row.totalCompletedRides,
          row.createdAt,
        ]),
      )
    } finally {
      setIsExporting(false)
    }
  }

  async function handleSetStatus(customerId: string, status: CustomerAccountStatus) {
    await updateCustomerStatus(customerId, status)
    await Promise.all([customers.refetch(), stats.refetch()])
    if (customerId === selectedId) setDetailRefreshToken((token) => token + 1)
  }

  return (
    <AdminLayout>
      <div className="flex flex-col gap-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-primary">Customers Management</h1>
            <p className="text-sm text-muted">Manage and monitor user accounts across the fleet.</p>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => void handleExport()}
              disabled={isExporting}
              className="flex items-center gap-2 rounded-button border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-primary transition hover:bg-gray-50 disabled:opacity-60"
            >
              <Download className="h-4 w-4" />
              {isExporting ? 'Exporting…' : 'Export List'}
            </button>
            <button
              type="button"
              onClick={() => setShowFilters((prev) => !prev)}
              className={`flex items-center gap-2 rounded-button border px-4 py-2.5 text-sm font-medium transition ${
                showFilters ? 'border-accent bg-accent/5 text-accent' : 'border-gray-200 bg-white text-primary hover:bg-gray-50'
              }`}
            >
              <SlidersHorizontal className="h-4 w-4" />
              Advanced Filters
            </button>
          </div>
        </div>

        <CustomerStatCards stats={stats.stats} isLoading={stats.isLoading} error={stats.error} />

        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
          <Card className="overflow-hidden p-0 lg:col-span-8">
            <div className="flex items-center justify-between border-b border-gray-100 p-6">
              <h4 className="text-lg font-bold text-primary">All Customers</h4>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted">Sort by:</span>
                <select
                  value={customers.sort}
                  onChange={(e) => customers.setSort(e.target.value as CustomerSortOption)}
                  className="cursor-pointer border-0 bg-transparent text-sm font-semibold text-primary focus:outline-none focus:ring-0"
                >
                  {SORT_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {showFilters && (
              <div className="flex flex-wrap items-center gap-3 border-b border-gray-100 bg-gray-50/60 p-4">
                <div className="relative max-w-xs flex-1">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                  <input
                    type="search"
                    value={customers.searchInput}
                    onChange={(e) => customers.setSearchInput(e.target.value)}
                    placeholder="Search by name, email or phone…"
                    className="w-full rounded-lg border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm text-primary placeholder:text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                  />
                </div>

                <select
                  value={customers.status}
                  onChange={(e) => customers.setStatus(e.target.value as typeof customers.status)}
                  className="rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm font-medium text-primary focus:border-accent focus:outline-none"
                >
                  {STATUS_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="overflow-x-auto">
              <CustomersTable
                rows={customers.rows}
                isLoading={customers.isLoading}
                error={customers.error}
                selectedId={selectedId}
                onSelect={setSelectedId}
                onSetStatus={(id, status) => void handleSetStatus(id, status)}
              />
            </div>

            {!customers.isLoading && !customers.error && customers.total > 0 && (
              <div className="p-4">
                <Pagination
                  page={customers.page}
                  pageSize={customers.pageSize}
                  total={customers.total}
                  onPageChange={customers.setPage}
                  itemLabel="customers"
                />
              </div>
            )}
          </Card>

          <div className="lg:sticky lg:top-6 lg:col-span-4">
            <CustomerDetailPanel customerId={selectedId} refreshToken={detailRefreshToken} />
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
