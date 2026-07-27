import { Download, Filter, Plus, Search } from 'lucide-react'
import { useState } from 'react'
import AdminLayout from '../../components/layout/AdminLayout'
import Card from '../../components/ui/Card'
import Pagination from '../../components/ui/Pagination'
import { downloadCsv } from '../../lib/csv'
import { createManager, fetchManagersForExport, updateManagerStatus } from '../../lib/managers'
import type { ManagerInput, ManagerStatus } from '../../types/managers'
import ManagerStatCards from './components/ManagerStatCards'
import ManagersTable from './components/ManagersTable'
import NewManagerPanel from './components/NewManagerPanel'
import { useManagerRoles } from './hooks/useManagerRoles'
import { useManagers } from './hooks/useManagers'
import { useManagerStats } from './hooks/useManagerStats'

export default function Managers() {
  const {
    rows,
    total,
    isLoading,
    error,
    refetch,
    searchInput,
    setSearchInput,
    filterPill,
    setFilterPill,
    status,
    setStatus,
    role,
    setRole,
    page,
    setPage,
    pageSize,
  } = useManagers()

  const { stats, isLoading: statsLoading, error: statsError, refetch: refetchStats } = useManagerStats()
  const { roles } = useManagerRoles()

  const [isPanelOpen, setIsPanelOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [showFilters, setShowFilters] = useState(false)

  async function handleCreateManager(input: ManagerInput) {
    setIsSaving(true)
    try {
      await createManager(input)
      await Promise.all([refetch(), refetchStats()])
    } finally {
      setIsSaving(false)
    }
  }

  async function handleSetStatus(managerId: string, nextStatus: ManagerStatus) {
    await updateManagerStatus(managerId, nextStatus)
    await Promise.all([refetch(), refetchStats()])
  }

  async function handleExport() {
    setIsExporting(true)
    try {
      const exportRows = await fetchManagersForExport({
        search: searchInput,
        filterPill,
        status,
        role,
      })
      const headers = ['Full Name', 'Email', 'Role', 'Province', 'District', 'Status', 'Last Login', 'Created At']
      const csvRows = exportRows.map((r) => [
        r.fullName,
        r.email,
        r.role ?? 'Unassigned',
        r.province ?? 'Unassigned',
        r.district ?? 'Unassigned',
        r.status,
        r.lastLoginAt ?? 'Never',
        r.createdAt,
      ])
      downloadCsv('2go-managers.csv', headers, csvRows)
    } catch (err) {
      console.error('Failed to export managers', err)
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <AdminLayout>
      <div className="flex flex-col gap-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="relative w-full max-w-md flex-1">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input
              type="search"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search managers by name, role or region..."
              className="w-full rounded-lg border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm text-primary placeholder:text-muted shadow-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            />
          </div>

          <button
            type="button"
            onClick={() => setIsPanelOpen(true)}
            className="flex items-center gap-1.5 rounded-button border-0 bg-accent px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:brightness-105"
          >
            <Plus className="h-4 w-4" />
            Add Manager
          </button>
        </div>

        <ManagerStatCards stats={stats} isLoading={statsLoading} error={statsError} />

        <Card className="p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-100 pb-5">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-primary mr-2">Manager Directory</h2>
              <div className="flex items-center gap-1.5 rounded-full bg-gray-100/80 p-1">
                <button
                  type="button"
                  onClick={() => setFilterPill('all')}
                  className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition ${
                    filterPill === 'all'
                      ? 'bg-primary text-white shadow-sm'
                      : 'text-muted hover:text-primary'
                  }`}
                >
                  All Roles
                </button>
                <button
                  type="button"
                  onClick={() => setFilterPill('fleet_only')}
                  className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition ${
                    filterPill === 'fleet_only'
                      ? 'bg-primary text-white shadow-sm'
                      : 'text-muted hover:text-primary'
                  }`}
                >
                  Fleet Only
                </button>
                <button
                  type="button"
                  onClick={() => setFilterPill('approved')}
                  className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition ${
                    filterPill === 'approved'
                      ? 'bg-primary text-white shadow-sm'
                      : 'text-muted hover:text-primary'
                  }`}
                >
                  Approved
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => setShowFilters((prev) => !prev)}
                className={`flex items-center gap-1.5 rounded-lg border px-3.5 py-2 text-xs font-bold transition ${
                  showFilters || status !== 'all' || role !== 'all'
                    ? 'border-accent bg-accent/10 text-accent'
                    : 'border-gray-200 bg-white text-primary hover:bg-gray-50'
                }`}
              >
                <Filter className="h-3.5 w-3.5" />
                Filter
              </button>

              <button
                type="button"
                onClick={() => void handleExport()}
                disabled={isExporting}
                className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3.5 py-2 text-xs font-bold text-primary transition hover:bg-gray-50 disabled:opacity-60"
              >
                <Download className="h-3.5 w-3.5" />
                {isExporting ? 'Exporting...' : 'Export'}
              </button>
            </div>
          </div>

          {showFilters && (
            <div className="mt-4 flex flex-wrap items-center gap-4 rounded-lg bg-gray-50/60 p-4 border border-gray-100">
              <div className="flex items-center gap-2">
                <label htmlFor="filter-status" className="text-xs font-bold uppercase tracking-wider text-muted">
                  Status:
                </label>
                <select
                  id="filter-status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-primary focus:border-accent focus:outline-none"
                >
                  <option value="all">All Statuses</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="pending">Pending</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <label htmlFor="filter-role" className="text-xs font-bold uppercase tracking-wider text-muted">
                  Role:
                </label>
                <select
                  id="filter-role"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-primary focus:border-accent focus:outline-none"
                >
                  <option value="all">All Roles</option>
                  {roles.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>

              {(status !== 'all' || role !== 'all') && (
                <button
                  type="button"
                  onClick={() => {
                    setStatus('all')
                    setRole('all')
                  }}
                  className="ml-auto text-xs font-semibold text-accent hover:underline"
                >
                  Reset Filters
                </button>
              )}
            </div>
          )}

          <div className="mt-4 -mx-6">
            <ManagersTable
              rows={rows}
              isLoading={isLoading}
              error={error}
              onSetStatus={(id, next) => void handleSetStatus(id, next)}
            />
          </div>

          <div className="mt-2">
            <Pagination page={page} pageSize={pageSize} total={total} onPageChange={setPage} itemLabel="Managers" />
          </div>
        </Card>
      </div>

      <NewManagerPanel
        open={isPanelOpen}
        isSaving={isSaving}
        onClose={() => setIsPanelOpen(false)}
        onSave={handleCreateManager}
      />
    </AdminLayout>
  )
}
