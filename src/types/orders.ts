export type OrderStatus = 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled'
export type OrderTab = 'pending' | 'active' | 'completed' | 'cancelled' | 'history'
export type OrderSortColumn = 'created_at' | 'fare_amount'
export type SortDirection = 'asc' | 'desc'

export interface OrderListRow {
  id: string
  orderNumber: number
  status: OrderStatus
  customerName: string
  customerPhotoUrl: string | null
  driverName: string | null
  vehicleClass: string | null
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
  paymentMethod: string | null
  requestedAt: string
  completedAt: string | null
  baseFare: number
  serviceFeePct: number
  serviceFeeAmount: number
  customerRating: number | null
  driverRating: number | null
  driverLicensePlate: string | null
  driverCurrentLat: number | null
  driverCurrentLng: number | null
}

export interface OrderFilters {
  tab: OrderTab
  search: string
  vehicleClass: 'all' | 'economy' | 'suv' | 'luxury' | 'sprinter'
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
