export type DriverAccountStatus = 'pending' | 'approved' | 'rejected' | 'suspended'
export type DriverLiveStatus = 'active' | 'idle' | 'offline'
export type VehicleClass = 'economy' | 'suv' | 'luxury' | 'sprinter'
export type OrderStatus = 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled'

export interface DashboardStats {
  totalCustomers: number
  customerGrowthPct: number | null
  totalOrders: number
  orderGrowthPct: number | null
  activeOrders: number
  totalDrivers: number
  activeDriversNow: number
  totalRevenueThisMonth: number
  pendingApprovals: number
}

export type RevenueRangePreset = 'today' | 'week' | 'month' | 'custom'

export interface RevenueRange {
  preset: RevenueRangePreset
  from: Date
  to: Date
}

export interface RevenuePoint {
  key: string
  label: string
  revenue: number
}

export interface PendingDriverRow {
  id: string
  firstName: string
  lastName: string
  profilePhotoUrl: string | null
  vehicleClass: VehicleClass
  createdAt: string
}

export interface TopDriverRow {
  id: string
  firstName: string
  lastName: string
  profilePhotoUrl: string | null
  vehicleMake: string | null
  vehicleModel: string | null
  vehicleYear: number | null
  rating: number
  totalEarnings: number
  driverStatus: DriverLiveStatus
}

export interface LiveOperationsDriver {
  id: string
  firstName: string
  lastName: string
  driverStatus: DriverLiveStatus
  currentLat: number | null
  currentLng: number | null
}

export interface LiveOperations {
  active: number
  idle: number
  offline: number
  drivers: LiveOperationsDriver[]
}
