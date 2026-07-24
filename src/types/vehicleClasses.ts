export type VehicleClassStatus = 'active' | 'inactive'

export interface VehicleClassRow {
  id: string
  name: string
  description: string | null
  iconSvgUrl: string | null
  iconSvgKey: string | null
  maxCapacity: number
  status: VehicleClassStatus
  displayOrder: number
  createdAt: string
  updatedAt: string
}

export interface VehicleClassStats {
  totalClasses: number
  newThisMonth: number
  activeTiers: number
  utilizationPct: number
  avgCapacity: number
}

export interface VehicleClassInput {
  name: string
  maxCapacity: number
  status: VehicleClassStatus
  iconSvgUrl?: string | null
  iconSvgKey?: string | null
}
