import { MapPin, Phone, Printer, Star } from 'lucide-react'
import Avatar from '../../../components/ui/Avatar'
import Card from '../../../components/ui/Card'
import Skeleton from '../../../components/ui/Skeleton'
import SlideOver from '../../../components/ui/SlideOver'
import StateMessage from '../../../components/ui/StateMessage'
import { formatCurrency, formatDateTime } from '../../../lib/format'
import { useOrderDetail } from '../hooks/useOrderDetail'
import RouteMap from './RouteMap'

interface OrderDetailPanelProps {
  orderId: string | null
  onClose: () => void
}

const KM_TO_MILES = 0.621371

interface TimelineEvent {
  label: string
  at: string
}

export default function OrderDetailPanel({ orderId, onClose }: OrderDetailPanelProps) {
  const { order, isLoading, error } = useOrderDetail(orderId)

  const timelineEvents: TimelineEvent[] = order
    ? (
        [
          { label: 'Order Placed', at: order.requestedAt },
          order.acceptedAt ? { label: 'Driver Accepted', at: order.acceptedAt } : null,
          order.driverArrivedAt ? { label: 'Driver Arrived', at: order.driverArrivedAt } : null,
          order.tripStartedAt ? { label: 'Trip Started', at: order.tripStartedAt } : null,
          order.completedAt ? { label: 'Trip Completed', at: order.completedAt } : null,
          order.cancelledAt ? { label: 'Order Cancelled', at: order.cancelledAt } : null,
        ].filter((event): event is TimelineEvent => event !== null)
      ).sort((a, b) => new Date(a.at).getTime() - new Date(b.at).getTime())
    : []

  function handlePrintReceipt() {
    window.print()
  }

  function handleContactDriver() {
    if (order?.driverPhone) window.location.href = `tel:${order.driverPhone}`
  }

  return (
    <SlideOver
      open={Boolean(orderId)}
      onClose={onClose}
      title={order ? `#ORD-${order.orderNumber}` : 'Order'}
      subtitle={<span className="text-xs font-semibold uppercase tracking-widest">Order Details</span>}
      footer={
        order && (
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handlePrintReceipt}
              className="flex flex-1 items-center justify-center gap-2 rounded-button border border-gray-200 bg-white py-3 text-sm font-bold text-primary hover:bg-gray-50"
            >
              <Printer className="h-4 w-4" />
              Print Receipt
            </button>
            <button
              type="button"
              disabled={!order.driverPhone}
              onClick={handleContactDriver}
              className="flex flex-1 items-center justify-center gap-2 rounded-button border-0 bg-primary py-3 text-sm font-bold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Phone className="h-4 w-4" />
              Contact Driver
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
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">Route Visualization</p>
            <RouteMap
              pickup={order.pickupLat != null && order.pickupLng != null ? { lat: order.pickupLat, lng: order.pickupLng } : null}
              dropoff={order.dropoffLat != null && order.dropoffLng != null ? { lat: order.dropoffLat, lng: order.dropoffLng } : null}
              distanceMiles={order.tripDistanceKm != null ? order.tripDistanceKm * KM_TO_MILES : null}
            />

            <div className="mt-4 flex flex-col gap-3">
              <div className="flex items-start gap-3">
                <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-[#00A67D]" />
                <div>
                  <p className="text-xs text-muted">Pickup</p>
                  <p className="text-sm font-semibold text-primary">{order.pickupAddress ?? 'Not recorded'}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent" />
                <div>
                  <p className="text-xs text-muted">Drop-off</p>
                  <p className="text-sm font-semibold text-primary">{order.dropoffAddress ?? 'Not recorded'}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Card className="border border-gray-100 p-4 shadow-none">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted">Customer</p>
              <div className="mt-2 flex items-center gap-3">
                <Avatar name={order.customerName} photoUrl={order.customerPhotoUrl} size={40} />
                <p className="text-sm font-bold text-primary">{order.customerName}</p>
              </div>
            </Card>

            <Card className="border border-gray-100 p-4 shadow-none">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted">Driver</p>
              {order.driverName ? (
                <div className="mt-2 flex items-center gap-3">
                  <Avatar name={order.driverName} photoUrl={order.driverPhotoUrl} size={40} />
                  <div>
                    <p className="text-sm font-bold text-primary">{order.driverName}</p>
                    {order.driverLicensePlate && <p className="text-xs text-muted">Plate: {order.driverLicensePlate}</p>}
                    {order.driverRating != null && (
                      <p className="flex items-center gap-1 text-xs text-muted">
                        <Star className="h-3 w-3 fill-warning text-warning" />
                        Rating: {order.driverRating.toFixed(1)}
                      </p>
                    )}
                    {order.driverCode && <p className="text-xs text-muted">ID: #{order.driverCode}</p>}
                  </div>
                </div>
              ) : (
                <p className="mt-2 text-sm italic text-muted">Unassigned</p>
              )}
            </Card>
          </div>

          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">Fare Breakdown</p>
            <div className="flex flex-col gap-2 rounded-card border border-gray-100 p-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted">Base Fare</span>
                <span className="font-semibold text-primary">{formatCurrency(order.baseFare)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted">
                  Distance{order.tripDistanceKm != null ? ` (${(order.tripDistanceKm * KM_TO_MILES).toFixed(1)} mi)` : ''}
                </span>
                <span className="font-semibold text-primary">{formatCurrency(order.distanceFareAmount)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted">
                  Time{order.tripDurationMinutes != null ? ` (${order.tripDurationMinutes} mins)` : ''}
                </span>
                <span className="font-semibold text-primary">{formatCurrency(order.timeFareAmount)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted">Service Fee</span>
                <span className="font-semibold text-primary">{formatCurrency(order.serviceFeeAmount)}</span>
              </div>
              <div className="mt-2 flex items-center justify-between border-t border-gray-100 pt-3">
                <span className="text-sm font-bold text-primary">Total Paid</span>
                <span className="text-lg font-bold text-accent">{formatCurrency(order.fareAmount)}</span>
              </div>
            </div>
          </div>

          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted">Ride Timeline</p>
            <div className="flex flex-col">
              {timelineEvents.map((event, index) => (
                <div key={event.label} className="relative flex gap-3 pb-5 last:pb-0">
                  {index < timelineEvents.length - 1 && (
                    <span className="absolute left-[5px] top-3 h-full w-px bg-gray-200" aria-hidden="true" />
                  )}
                  <span className="relative mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full bg-accent" />
                  <div>
                    <p className="text-sm font-semibold text-primary">{event.label}</p>
                    <p className="text-xs text-muted">{formatDateTime(event.at)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted">Date Started</p>
              <p className="mt-1 text-sm font-semibold text-primary">
                {order.tripStartedAt ? formatDateTime(order.tripStartedAt) : '—'}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted">Date Ended</p>
              <p className="mt-1 text-sm font-semibold text-primary">
                {order.completedAt ? formatDateTime(order.completedAt) : '—'}
              </p>
            </div>
          </div>
        </div>
      )}
    </SlideOver>
  )
}
