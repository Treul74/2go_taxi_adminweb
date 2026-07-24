import { Download, Plus, Search, UserPlus } from 'lucide-react'
import { useState } from 'react'
import AdminLayout from '../../components/layout/AdminLayout'
import Card from '../../components/ui/Card'
import Pagination from '../../components/ui/Pagination'
import Tabs from '../../components/ui/Tabs'
import { downloadCsv } from '../../lib/csv'
import { fetchDriversForExport, updateDriverAccountStatus } from '../../lib/drivers'
import type { DriverAccountStatus } from '../../types/drivers'
import DriverStatCards from './components/DriverStatCards'
import DriversTable from './components/DriversTable'
import { useDriverStats } from './hooks/useDriverStats'
import { useDrivers } from './hooks/useDrivers'

const TAB_ITEMS: { value: 'all' | DriverAccountStatus; label: string }[] = [
  { value: 'all', label: 'All Drivers' },
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'suspended', label: 'Suspended' },
  { value: 'rejected', label: 'Rejected' },
]

export default function Drivers() {
  const stats = useDriverStats()
  const drivers = useDrivers()
  const [isExporting, setIsExporting] = useState(false)

  async function handleExport() {
    setIsExporting(true)
    try {
      const rows = await fetchDriversForExport({ search: drivers.searchInput, status: drivers.status })
      downloadCsv(
        `drivers-${new Date().toISOString().slice(0, 10)}.csv`,
        ['Driver ID', 'Name', 'Email', 'Vehicle Type', 'Status', 'Joined'],
        rows.map((row) => [
          row.driverCode,
          `${row.firstName} ${row.lastName}`.trim(),
          row.email,
          row.vehicleType,
          row.accountStatus,
          row.createdAt,
        ]),
      )
    } finally {
      setIsExporting(false)
    }
  }

  async function handleSetStatus(driverId: string, status: DriverAccountStatus) {
    await updateDriverAccountStatus(driverId, status)
    await Promise.all([drivers.refetch(), stats.refetch()])
  }

  const tabItems = TAB_ITEMS.map((item) => (item.value === 'pending' ? { ...item, badge: stats.stats?.pendingApproval } : item))

  return (
    <AdminLayout>
      <div className="flex flex-col gap-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-primary">Drivers Management</h1>
            <p className="text-sm text-muted">Review and manage your global fleet of verified partners.</p>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => void handleExport()}
              disabled={isExporting}
              className="flex items-center gap-2 rounded-button border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-primary transition hover:bg-gray-50 disabled:opacity-60"
            >
              <Download className="h-4 w-4" />
              {isExporting ? 'Exporting…' : 'Export CSV'}
            </button>
            <button
              type="button"
              className="flex items-center gap-2 rounded-button border-0 bg-primary px-4 py-2.5 text-sm font-bold text-white transition hover:brightness-110"
            >
              <UserPlus className="h-4 w-4" />
              Onboard Driver
            </button>
          </div>
        </div>

        <DriverStatCards stats={stats.stats} isLoading={stats.isLoading} error={stats.error} />

        <Card className="p-6">
          <Tabs items={tabItems} value={drivers.status} onChange={drivers.setStatus} />

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <div className="relative max-w-xs flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
              <input
                type="search"
                value={drivers.searchInput}
                onChange={(e) => drivers.setSearchInput(e.target.value)}
                placeholder="Search drivers by name, ID or license…"
                className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-4 text-sm text-primary placeholder:text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
              />
            </div>
          </div>

          <div className="mt-4 overflow-x-auto">
            <DriversTable
              rows={drivers.rows}
              isLoading={drivers.isLoading}
              error={drivers.error}
              onSetStatus={(id, status) => void handleSetStatus(id, status)}
            />
          </div>

          {!drivers.isLoading && !drivers.error && drivers.total > 0 && (
            <div className="mt-4">
              <Pagination
                page={drivers.page}
                pageSize={drivers.pageSize}
                total={drivers.total}
                onPageChange={drivers.setPage}
                itemLabel="drivers"
              />
            </div>
          )}
        </Card>
      </div>

      <button
        type="button"
        aria-label="Onboard driver"
        className="fixed bottom-8 right-8 flex h-14 w-14 items-center justify-center rounded-full border-0 bg-accent text-white shadow-lg transition hover:brightness-105"
      >
        <Plus className="h-6 w-6" />
      </button>
    </AdminLayout>
  )
}
