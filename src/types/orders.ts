export type OrderStatus = 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled' | 'expired'
export type OrderTab = 'all' | 'pending' | 'active' | 'completed' | 'cancelled' | 'history'
export type OrderVehicleType = 'economy' | 'comfort' | 'bike' | 'tricycle' | 'truck'
export type OrderSortColumn = 'order_number' | 'created_at' | 'fare_amount'
export type SortDirection = 'asc' | 'desc'

export interface OrderListRow {
  id: string
  orderNumber: number
  status: OrderStatus
  customerName: string
  customerPhotoUrl: string | null
  driverName: string | null
  driverPhotoUrl: string | null
  vehicleType: OrderVehicleType | null
  vehicleMake: string | null
  vehicleModel: string | null
  fareAmount: number
  createdAt: string
}

export interface OrderDetail extends OrderListRow {
  pickupAddress: string | null
  pickupLat: number | null
  pickupLng: number | null
  dropoffAddress: string | null
  dropoffLat: number | null
  dropoffLng: number | null
  requestedAt: string
  acceptedAt: string | null
  driverArrivedAt: string | null
  tripStartedAt: string | null
  completedAt: string | null
  cancelledAt: string | null
  baseFare: number
  distanceFareAmount: number
  timeFareAmount: number
  serviceFeeAmount: number
  tripDistanceKm: number | null
  tripDurationMinutes: number | null
  customerPhone: string | null
  driverPhone: string | null
  driverCode: string | null
  driverRating: number | null
  driverLicensePlate: string | null
}

export interface OrderFilters {
  tab: OrderTab
  search: string
  vehicleType: 'all' | OrderVehicleType
  dateFrom: Date | null
  dateTo: Date | null
  sortBy: OrderSortColumn
  sortDirection: SortDirection
  page: number
  pageSize: number
}

export interface OrderListResult {
  rows: OrderListRow[]
  total: number
}
