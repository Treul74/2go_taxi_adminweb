export type ManagerStatus = 'pending' | 'approved' | 'rejected'

export type ManagerFilterPill = 'all' | 'fleet_only' | 'approved'

export interface ManagerRow {
  id: string
  authId: string
  fullName: string
  email: string
  role: string | null
  province: string | null
  district: string | null
  status: ManagerStatus
  lastLoginAt: string | null
  createdAt: string
}

export interface ManagerStats {
  totalManagers: number
  currentlyOnline: number
  activeRegions: number
  pendingApproval: number
}

export interface ManagerInput {
  fullName: string
  email: string
  role: string
  province: string
  district: string
}

export interface ManagerFilters {
  search: string
  filterPill: ManagerFilterPill
  status?: string
  role?: string
  page: number
  pageSize: number
}

export interface ManagerListResult {
  rows: ManagerRow[]
  total: number
}
