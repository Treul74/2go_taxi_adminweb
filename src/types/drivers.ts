export type DriverAccountStatus = 'pending' | 'approved' | 'suspended' | 'rejected' | 'inactive'
export type DriverVehicleType = 'economy' | 'comfort' | 'bike' | 'tricycle' | 'truck'

export interface DriverListRow {
  id: string
  driverCode: string
  firstName: string
  lastName: string
  email: string
  profilePhotoUrl: string | null
  vehicleType: DriverVehicleType
  accountStatus: DriverAccountStatus
  createdAt: string
}

export interface DriverStats {
  total: number
  activeNow: number
  pendingApproval: number
  fleetRating: number
}

export interface DriverFilters {
  search: string
  status: 'all' | DriverAccountStatus
  page: number
  pageSize: number
}

export interface DriverListResult {
  rows: DriverListRow[]
  total: number
}
