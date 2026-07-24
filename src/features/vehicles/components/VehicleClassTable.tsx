import { Car, Pencil } from 'lucide-react'
import Skeleton from '../../../components/ui/Skeleton'
import StateMessage from '../../../components/ui/StateMessage'
import Switch from '../../../components/ui/Switch'
import type { VehicleClassRow } from '../../../types/vehicleClasses'

interface VehicleClassTableProps {
  rows: VehicleClassRow[]
  isLoading: boolean
  error: string | null
  savingId: string | null
  onToggleStatus: (id: string, nextStatus: 'active' | 'inactive') => void
  onEdit: (row: VehicleClassRow) => void
}

export default function VehicleClassTable({
  rows,
  isLoading,
  error,
  savingId,
  onToggleStatus,
  onEdit,
}: VehicleClassTableProps) {
  if (error) {
    return <StateMessage variant="error" title="Unable to load vehicle classes" description={error} />
  }

  if (isLoading) {
    return (
      <div className="flex flex-col gap-3 py-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-14 w-full" />
        ))}
      </div>
    )
  }

  if (rows.length === 0) {
    return <StateMessage variant="empty" title="No vehicle classes yet" description="Add your first vehicle class to get started." />
  }

  return (
    <table className="w-full text-left text-sm">
      <thead>
        <tr className="border-b border-gray-100">
          <th className="pb-3 pr-4 text-xs font-semibold uppercase tracking-wide text-muted">Icon</th>
          <th className="pb-3 pr-4 text-xs font-semibold uppercase tracking-wide text-muted">Name</th>
          <th className="pb-3 pr-4 text-xs font-semibold uppercase tracking-wide text-muted">Description</th>
          <th className="pb-3 pr-4 text-xs font-semibold uppercase tracking-wide text-muted">Capacity</th>
          <th className="pb-3 pr-4 text-xs font-semibold uppercase tracking-wide text-muted">Status</th>
          <th className="pb-3 text-xs font-semibold uppercase tracking-wide text-muted">Actions</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.id} className="border-b border-gray-50">
            <td className="py-3 pr-4">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100 text-primary">
                {row.iconSvgUrl ? (
                  <img src={row.iconSvgUrl} alt={`${row.name} icon`} className="h-5 w-5" />
                ) : (
                  <Car className="h-4 w-4" />
                )}
              </span>
            </td>
            <td className="py-3 pr-4 font-bold text-primary">{row.name}</td>
            <td className="py-3 pr-4 max-w-xs text-muted">{row.description}</td>
            <td className="py-3 pr-4 text-primary">{row.maxCapacity} Pax</td>
            <td className="py-3 pr-4">
              <Switch
                checked={row.status === 'active'}
                disabled={savingId === row.id}
                onChange={(checked) => onToggleStatus(row.id, checked ? 'active' : 'inactive')}
                label={`Toggle ${row.name} status`}
              />
            </td>
            <td className="py-3">
              <button
                type="button"
                aria-label={`Edit ${row.name}`}
                onClick={() => onEdit(row)}
                className="flex h-8 w-8 items-center justify-center rounded-lg border-0 bg-transparent text-muted transition hover:bg-gray-100 hover:text-primary"
              >
                <Pencil className="h-4 w-4" />
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
