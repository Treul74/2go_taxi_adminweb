import { Car } from 'lucide-react'
import { useState } from 'react'
import Avatar from '../../../components/ui/Avatar'
import Card from '../../../components/ui/Card'
import Skeleton from '../../../components/ui/Skeleton'
import StateMessage from '../../../components/ui/StateMessage'
import { formatCurrency, formatDateTime, formatNumber } from '../../../lib/format'
import { useCustomerDetail } from '../hooks/useCustomerDetail'
import { CustomerStatusBadge } from './CustomerStatusBadge'

interface CustomerDetailPanelProps {
  customerId: string | null
  refreshToken?: number
}

export default function CustomerDetailPanel({ customerId, refreshToken = 0 }: CustomerDetailPanelProps) {
  const { customer, rideHistory, isLoading, error, setStatus } = useCustomerDetail(customerId, refreshToken)
  const [isUpdating, setIsUpdating] = useState(false)

  async function handleSetStatus(status: 'active' | 'suspended') {
    setIsUpdating(true)
    try {
      await setStatus(status)
    } finally {
      setIsUpdating(false)
    }
  }

  if (!customerId) {
    return (
      <Card className="p-6">
        <StateMessage variant="empty" title="Select a customer" description="Choose a row from the table to view their profile." />
      </Card>
    )
  }

  const name = customer ? [customer.firstName, customer.lastName].filter(Boolean).join(' ').trim() || 'Unknown customer' : ''

  return (
    <Card className="p-6">
      <div className="mb-6 flex items-start justify-between">
        <h4 className="text-lg font-bold text-primary">Customer Profile</h4>
        <span className="rounded border border-primary/20 bg-primary/5 px-2 py-1 text-[10px] font-bold uppercase text-primary">
          Details
        </span>
      </div>

      {error && <StateMessage variant="error" title="Unable to load customer" description={error} />}

      {isLoading && !customer && (
        <div className="flex flex-col gap-4">
          <Skeleton className="mx-auto h-24 w-24 rounded-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      )}

      {customer && (
        <div>
          <div className="mb-8 flex flex-col items-center text-center">
            <Avatar name={name} photoUrl={customer.profilePhotoUrl} size={96} />
            <h3 className="mt-4 text-xl font-bold text-primary">{name}</h3>
            <p className="text-sm text-muted">Account ID: 2G-{customer.id.slice(0, 6).toUpperCase()}</p>
            <div className="mt-3">
              <CustomerStatusBadge status={customer.accountStatus} />
            </div>
          </div>

          <div className="mb-8 grid grid-cols-2 gap-4">
            <div className="rounded-card bg-gray-50 p-3">
              <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-muted">Wallet Balance</p>
              <p className="text-lg font-bold text-primary">{formatCurrency(customer.walletBalance)}</p>
            </div>
            <div className="rounded-card bg-gray-50 p-3">
              <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-muted">Total Rides</p>
              <p className="text-lg font-bold text-primary">{formatNumber(customer.totalCompletedRides)}</p>
            </div>
          </div>

          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted">Ride History (Recent)</p>
            {rideHistory.length === 0 ? (
              <p className="text-sm text-muted">No rides yet.</p>
            ) : (
              <div className="flex flex-col gap-3">
                {rideHistory.map((ride) => (
                  <div
                    key={ride.id}
                    className="flex items-center justify-between rounded-card border border-gray-100 p-3 transition hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <Car className="h-4 w-4" />
                      </span>
                      <div>
                        <p className="text-sm font-semibold text-primary">
                          {ride.pickupAddress ?? 'Pickup'} to {ride.dropoffAddress ?? 'Drop-off'}
                        </p>
                        <p className="text-[10px] text-muted">{formatDateTime(ride.createdAt)}</p>
                      </div>
                    </div>
                    <p className="text-sm font-bold text-primary">{formatCurrency(ride.fareAmount)}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-8 flex gap-2">
            {customer.accountStatus !== 'suspended' && customer.accountStatus !== 'deleted' && (
              <button
                type="button"
                disabled={isUpdating}
                onClick={() => void handleSetStatus('suspended')}
                className="flex-1 rounded-button border border-gray-200 py-3 text-sm font-medium text-danger transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isUpdating ? 'Updating…' : 'Suspend Account'}
              </button>
            )}
            {customer.accountStatus !== 'active' && customer.accountStatus !== 'deleted' && (
              <button
                type="button"
                disabled={isUpdating}
                onClick={() => void handleSetStatus('active')}
                className="flex-1 rounded-button border-0 bg-primary py-3 text-sm font-medium text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isUpdating ? 'Updating…' : 'Activate Account'}
              </button>
            )}
          </div>
        </div>
      )}
    </Card>
  )
}
