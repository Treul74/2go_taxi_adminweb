import { ArrowRight, Check, X } from 'lucide-react'
import { useState } from 'react'
import Avatar from '../../../components/ui/Avatar'
import Card from '../../../components/ui/Card'
import Skeleton from '../../../components/ui/Skeleton'
import StateMessage from '../../../components/ui/StateMessage'
import { timeAgo } from '../../../lib/format'
import type { PendingDriverRow } from '../../../types/dashboard'
import DriverApplicationPanel from './DriverApplicationPanel'

interface DriverApprovalsProps {
  drivers: PendingDriverRow[]
  isLoading: boolean
  error: string | null
  actionError: string | null
  actioningId: string | null
  onApprove: (driverId: string) => void
  onReject: (driverId: string) => void
}

const VEHICLE_CLASS_LABEL: Record<string, string> = {
  economy: 'Economy',
  suv: 'SUV',
  luxury: 'Luxury',
  sprinter: 'Sprinter',
}

export default function DriverApprovals({
  drivers,
  isLoading,
  error,
  actionError,
  actioningId,
  onApprove,
  onReject,
}: DriverApprovalsProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  // Derived from the live list so the panel closes automatically once the
  // driver leaves the pending queue after an approve/reject.
  const selectedDriver = drivers.find((d) => d.id === selectedId) ?? null

  return (
    <Card className="flex h-full flex-col p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-primary">Driver Approvals</h2>
        {drivers.length > 0 && (
          <span className="rounded-full bg-danger/10 px-3 py-1 text-xs font-bold text-danger">
            {drivers.length} Pending
          </span>
        )}
      </div>

      {error ? (
        <StateMessage variant="error" title="Unable to load applications" description={error} />
      ) : isLoading ? (
        <div className="mt-4 flex flex-col gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : drivers.length === 0 ? (
        <StateMessage variant="empty" title="No pending applications" description="New driver applications will appear here." />
      ) : (
        <div className="mt-4 flex flex-1 flex-col gap-4">
          {actionError && <p className="text-xs font-semibold text-danger">{actionError}</p>}
          {drivers.map((driver) => (
            <div key={driver.id} className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setSelectedId(driver.id)}
                className="flex flex-1 items-center gap-3 rounded-lg border-0 bg-transparent p-0 text-left transition hover:bg-gray-50"
              >
                <Avatar name={`${driver.firstName} ${driver.lastName}`} photoUrl={driver.profilePhotoUrl} size={40} />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-primary">
                    {driver.firstName} {driver.lastName}
                  </p>
                  <p className="text-xs text-muted">
                    Applied {timeAgo(driver.createdAt)} • {VEHICLE_CLASS_LABEL[driver.vehicleClass] ?? driver.vehicleClass}
                  </p>
                </div>
              </button>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  aria-label={`Approve ${driver.firstName} ${driver.lastName}`}
                  disabled={actioningId === driver.id}
                  onClick={() => onApprove(driver.id)}
                  className="flex h-8 w-8 items-center justify-center rounded-full border-0 bg-success/10 text-success transition hover:bg-success/20 disabled:opacity-50"
                >
                  <Check className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  aria-label={`Reject ${driver.firstName} ${driver.lastName}`}
                  disabled={actioningId === driver.id}
                  onClick={() => onReject(driver.id)}
                  className="flex h-8 w-8 items-center justify-center rounded-full border-0 bg-danger/10 text-danger transition hover:bg-danger/20 disabled:opacity-50"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <button
        type="button"
        className="mt-6 flex w-full items-center justify-center gap-2 rounded-button border-0 bg-gray-100 py-2.5 text-sm font-semibold text-primary transition hover:bg-gray-200"
      >
        Manage All Applications
        <ArrowRight className="h-4 w-4" />
      </button>

      <DriverApplicationPanel
        driver={selectedDriver}
        actionError={actionError}
        isActioning={selectedDriver != null && actioningId === selectedDriver.id}
        onClose={() => setSelectedId(null)}
        onApprove={onApprove}
        onReject={onReject}
      />
    </Card>
  )
}
