export type CustomerAccountStatus = 'active' | 'suspended' | 'pending' | 'deleted'
export type CustomerSortOption = 'recent_activity' | 'join_date' | 'wallet_balance'

export interface CustomerListRow {
  id: string
  firstName: string | null
  lastName: string | null
  email: string | null
  phoneNumber: string | null
  countryCode: string | null
  profilePhotoUrl: string | null
  accountStatus: CustomerAccountStatus
  walletBalance: number
  totalCompletedRides: number
  createdAt: string
  updatedAt: string
}

export interface CustomerDetail extends CustomerListRow {
  rating: number
  totalRatings: number
  preferredPaymentMethod: string | null
}

export interface CustomerRideHistoryItem {
  id: string
  pickupAddress: string | null
  dropoffAddress: string | null
  fareAmount: number
  status: string
  createdAt: string
}

export interface CustomerStats {
  total: number
  active: number
  suspended: number
  deleted: number
}

export interface CustomerFilters {
  search: string
  status: 'all' | CustomerAccountStatus
  sort: CustomerSortOption
  page: number
  pageSize: number
}

export interface CustomerListResult {
  rows: CustomerListRow[]
  total: number
}
