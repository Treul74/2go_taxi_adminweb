import { MapPin, Star } from 'lucide-react'
import { useMemo, useState } from 'react'
import Avatar from '../../../components/ui/Avatar'
import Skeleton from '../../../components/ui/Skeleton'
import SlideOver from '../../../components/ui/SlideOver'
import StateMessage from '../../../components/ui/StateMessage'
import { formatCurrency, formatDateTime } from '../../../lib/format'
import { estimateEtaMinutes } from '../../../lib/geo'
import { useOrderDetail } from '../hooks/useOrderDetail'
import { OrderStatusBadge } from './OrderStatusBadge'
import RouteMap from './RouteMap'

interface OrderDetailPanelProps {
  orderId: string | null
  onClose: () => void
}

const VEHICLE_CLASS_LABEL: Record<string, string> = {
  economy: 'Economy',
  suv: 'SUV',
  luxury: 'Luxury',
  sprinter: 'Sprinter',
}

export default function OrderDetailPanel({ orderId, onClose }: OrderDetailPanelProps) {
  const { order, isLoading, error, cancelOrder } = useOrderDetail(orderId)
  const [isCancelling, setIsCancelling] = useState(false)

  const etaMinutes = useMemo(() => {
    if (!order) return null
    if (order.status !== 'accepted' && order.status !== 'in_progress') return null
    if (order.driverCurrentLat == null || order.driverCurrentLng == null) return null

    const target =
      order.status === 'accepted'
        ? { lat: order.pickupLat, lng: order.pickupLng }
        : { lat: order.dropoffLat, lng: order.dropoffLng }
    if (target.lat == null || target.lng == null) return null

    return estimateEtaMinutes({ lat: order.driverCurrentLat, lng: order.driverCurrentLng }, { lat: target.lat, lng: target.lng })
  }, [order])

  async function handleCancel() {
    setIsCancelling(true)
    try {
      await cancelOrder()
    } finally {
      setIsCancelling(false)
    }
  }

  const canCancel = order && order.status !== 'completed' && order.status !== 'cancelled'

  return (
    <SlideOver
      open={Boolean(orderId)}
      onClose={onClose}
      title={order ? `Order #ORD-${order.orderNumber}` : 'Order'}
      subtitle={order ? `Booked on ${formatDateTime(order.requestedAt)}` : undefined}
      footer={
        order && (
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="flex-1 rounded-button border border-gray-200 bg-white py-3 text-sm font-bold text-primary hover:bg-gray-50"
            >
              Modify Booking
            </button>
            <button
              type="button"
              disabled={!canCancel || isCancelling}
              onClick={() => void handleCancel()}
              className="flex-1 rounded-button border-0 bg-danger py-3 text-sm font-bold text-white transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isCancelling ? 'Cancelling…' : 'Cancel Order'}
            </button>
          </div>
        )
      }
    >
      {error && <StateMessage variant="error" title="Unable to load order" description={error} />}

      {isLoading && !order && (
        <div className="flex flex-col gap-4">
          <Skeleton className="h-56 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      )}

      {order && (
        <div className="flex flex-col gap-6">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">Route View</p>
            <RouteMap
              pickup={order.pickupLat != null && order.pickupLng != null ? { lat: order.pickupLat, lng: order.pickupLng } : null}
              dropoff={order.dropoffLat != null && order.dropoffLng != null ? { lat: order.dropoffLat, lng: order.dropoffLng } : null}
              etaMinutes={etaMinutes}
            />

            <div className="mt-4 flex flex-col gap-3">
              <div className="flex items-start gap-3">
                <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-accent" />
                <div>
                  <p className="text-xs text-muted">Pickup</p>
                  <p className="text-sm font-semibold text-primary">{order.pickupAddress ?? 'Not recorded'}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                <div>
                  <p className="text-xs text-muted">Drop-off</p>
                  <p className="text-sm font-semibold text-primary">{order.dropoffAddress ?? 'Not recorded'}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-muted">Status</span>
            <OrderStatusBadge status={order.status} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-card border border-gray-100 p-4">
              <p className="text-xs font-semibold text-muted">Customer</p>
              <div className="mt-2 flex items-center gap-3">
                <Avatar name={order.customerName} photoUrl={order.customerPhotoUrl} size={40} />
                <div>
                  <p className="text-sm font-bold text-primary">{order.customerName}</p>
                  {order.customerRating != null && (
                    <p className="flex items-center gap-1 text-xs text-muted">
                      <Star className="h-3 w-3 fill-warning text-warning" />
                      {order.customerRating.toFixed(1)} Rating
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="rounded-card border border-gray-100 p-4">
              <p className="text-xs font-semibold text-muted">Driver</p>
              {order.driverName ? (
                <div className="mt-2 flex items-center gap-3">
                  <Avatar name={order.driverName} photoUrl={null} size={40} />
                  <div>
                    <p className="text-sm font-bold text-primary">{order.driverName}</p>
                    <p className="text-xs text-muted">
                      {order.driverLicensePlate ?? '—'}
                      {order.vehicleClass ? ` • ${VEHICLE_CLASS_LABEL[order.vehicleClass] ?? order.vehicleClass}` : ''}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="mt-2 text-sm text-muted">Unassigned</p>
              )}
            </div>
          </div>

          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">Fare Breakdown</p>
            <div className="flex flex-col gap-2 rounded-card border border-gray-100 p-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted">Base Fare</span>
                <span className="font-semibold text-primary">{formatCurrency(order.baseFare)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted">Service Fee ({order.serviceFeePct.toFixed(0)}%)</span>
                <span className="font-semibold text-primary">{formatCurrency(order.serviceFeeAmount)}</span>
              </div>
              <div className="mt-2 flex items-center justify-between border-t border-gray-100 pt-3">
                <span className="text-sm font-bold text-primary">Total Earnings</span>
                <span className="text-lg font-bold text-primary">{formatCurrency(order.fareAmount)}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </SlideOver>
  )
}
