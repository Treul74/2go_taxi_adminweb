export type ServiceAreaStatus = 'active' | 'inactive'
export type EstimatedDemand = 'low' | 'medium' | 'high'
export type ServiceAreaType = 'polygon' | 'radius'

export interface LatLng {
  lat: number
  lng: number
}

export interface ServiceAreaRow {
  id: string
  province: string
  district: string
  name: string
  areaCode: string | null
  polygon: LatLng[]
  areaType: ServiceAreaType
  centerLat: number | null
  centerLng: number | null
  radiusMeters: number | null
  status: ServiceAreaStatus
  estimatedDemand: EstimatedDemand | null
  fleetSize: number
  baseFareMultiplier: number
  serviceTypes: string[]
  updatedAt: string
  createdAt: string
}

export interface ServiceAreaHierarchy {
  areas: ServiceAreaRow[]
}

export interface ServiceAreaInput {
  province: string
  district: string
  name: string
  areaCode: string
  estimatedDemand: EstimatedDemand
  fleetSize: number
  baseFareMultiplier: number
  serviceTypes: string[]
}
