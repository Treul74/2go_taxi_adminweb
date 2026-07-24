export type ServiceAreaStatus = 'active' | 'inactive'

export interface ServiceAreaRow {
  id: string
  name: string
  province: string
  district: string
  areaCode: string | null
  status: ServiceAreaStatus
  vehicleTypeIds: string[]
  createdAt: string
  updatedAt: string
}

export interface ServiceAreaInput {
  name: string
  province: string
  district: string
  status: ServiceAreaStatus
  vehicleTypeIds: string[]
}
