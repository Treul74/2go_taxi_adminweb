import { Bike, Car, CarFront, MoreVertical, Scooter, Truck } from 'lucide-react'
import type { ComponentType } from 'react'
import { useEffect, useRef, useState } from 'react'
import Avatar from '../../../components/ui/Avatar'
import Skeleton from '../../../components/ui/Skeleton'
import StateMessage from '../../../components/ui/StateMessage'
import { formatDate } from '../../../lib/format'
import type { DriverAccountStatus, DriverListRow, DriverVehicleType } from '../../../types/drivers'
import { DriverStatusBadge } from './DriverStatusBadge'

interface DriversTableProps {
  rows: DriverListRow[]
  isLoading: boolean
  error: string | null
  onSetStatus: (driverId: string, status: DriverAccountStatus) => void
}

const VEHICLE_TYPE_ICON: Record<DriverVehicleType, ComponentType<{ className?: string }>> = {
  economy: Car,
  comfort: CarFront,
  bike: Bike,
  tricycle: Scooter,
  truck: Truck,
}

const VEHICLE_TYPE_LABEL: Record<DriverVehicleType, string> = {
  economy: 'Economy',
  comfort: 'Comfort',
  bike: 'Bike',
  tricycle: 'Tricycle',
  truck: 'Truck',
}

function driverName(row: DriverListRow) {
  return `${row.firstName} ${row.lastName}`.trim() || 'Unknown driver'
}

function RowActionMenu({ row, onSetStatus }: { row: DriverListRow; onSetStatus: DriversTableProps['onSetStatus'] }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  function choose(status: DriverAccountStatus) {
    setOpen(false)
    onSetStatus(row.id, status)
  }

  return (
    <div ref={ref} className="relative inline-block text-left">
      <button
        type="button"
        aria-label={`Actions for ${driverName(row)}`}
        onClick={() => setOpen((prev) => !prev)}
        className="flex h-8 w-8 items-center justify-center rounded-lg border-0 bg-transparent text-muted transition hover:bg-gray-100 hover:text-primary"
      >
        <MoreVertical className="h-4 w-4" />
      </button>

      {open && (
        <div className="absolute right-0 z-10 mt-1 w-44 rounded-lg border border-gray-100 bg-white py-1 shadow-lg">
          {row.accountStatus !== 'approved' && (
            <button
              type="button"
              onClick={() => choose('approved')}
              className="block w-full border-0 bg-transparent px-4 py-2 text-left text-sm text-success hover:bg-gray-50"
            >
              Activate
            </button>
          )}
          {row.accountStatus !== 'inactive' && row.accountStatus !== 'rejected' && (
            <button
              type="button"
              onClick={() => choose('inactive')}
              className="block w-full border-0 bg-transparent px-4 py-2 text-left text-sm text-muted hover:bg-gray-50"
            >
              Deactivate
            </button>
          )}
          {row.accountStatus !== 'suspended' && (
            <button
              type="button"
              onClick={() => choose('suspended')}
              className="block w-full border-0 bg-transparent px-4 py-2 text-left text-sm text-danger hover:bg-gray-50"
            >
              Suspend
            </button>
          )}
          {row.accountStatus === 'pending' && (
            <button
              type="button"
              onClick={() => choose('rejected')}
              className="block w-full border-0 bg-transparent px-4 py-2 text-left text-sm text-danger hover:bg-gray-50"
            >
              Reject
            </button>
          )}
        </div>
      )}
    </div>
  )
}

export default function DriversTable({ rows, isLoading, error, onSetStatus }: DriversTableProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  function toggleAll() {
    setSelectedIds((prev) => (prev.size === rows.length ? new Set() : new Set(rows.map((row) => row.id))))
  }

  function toggleRow(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  if (error) {
    return <StateMessage variant="error" title="Unable to load drivers" description={error} />
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
    return <StateMessage variant="empty" title="No drivers found" description="Try adjusting your search or filters." />
  }

  return (
    <table className="w-full text-left text-sm">
      <thead>
        <tr className="border-b border-gray-100 bg-gray-50/60">
          <th className="w-10 px-6 py-3">
            <input
              type="checkbox"
              aria-label="Select all drivers"
              checked={selectedIds.size === rows.length}
              onChange={toggleAll}
              className="h-4 w-4 rounded border-gray-300 text-accent focus:ring-accent"
            />
          </th>
          <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-muted">Driver Name</th>
          <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-muted">Driver ID</th>
          <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-muted">Vehicle Type</th>
          <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-muted">Join Date</th>
          <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-muted">Status</th>
          <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wide text-muted">Actions</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => {
          const VehicleIcon = VEHICLE_TYPE_ICON[row.vehicleType]
          return (
            <tr key={row.id} className="border-b border-gray-50 transition hover:bg-primary/5">
              <td className="px-6 py-4">
                <input
                  type="checkbox"
                  aria-label={`Select ${driverName(row)}`}
                  checked={selectedIds.has(row.id)}
                  onChange={() => toggleRow(row.id)}
                  className="h-4 w-4 rounded border-gray-300 text-accent focus:ring-accent"
                />
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                  <Avatar name={driverName(row)} photoUrl={row.profilePhotoUrl} size={40} />
                  <div>
                    <p className="font-semibold text-primary">{driverName(row)}</p>
                    <p className="text-xs text-muted">{row.email}</p>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 text-primary">{row.driverCode}</td>
              <td className="px-6 py-4">
                <div className="flex items-center gap-2 text-primary">
                  <VehicleIcon className="h-4 w-4 text-muted" />
                  {VEHICLE_TYPE_LABEL[row.vehicleType]}
                </div>
              </td>
              <td className="px-6 py-4 text-muted">{formatDate(row.createdAt)}</td>
              <td className="px-6 py-4">
                <DriverStatusBadge status={row.accountStatus} />
              </td>
              <td className="px-6 py-4 text-right">
                <RowActionMenu row={row} onSetStatus={onSetStatus} />
              </td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}
