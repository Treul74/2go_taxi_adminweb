export interface FareConfigRow {
  id: string
  vehicleClassId: string
  vehicleType: string
  baseFare: number
  minFare: number
  perKm: number
  perMinute: number
  perMinuteWaiting: number
  cancellationFee: number
  nightRateMultiplier: number
  peakMultiplier: number
  platformCommissionPct: number
  driverCommissionPct: number
  isActive: boolean
  updatedAt: string
}

export interface FareConfigInput {
  baseFare: number
  minFare: number
  perKm: number
  perMinute: number
  perMinuteWaiting: number
  cancellationFee: number
  nightRateMultiplier: number
  peakMultiplier: number
  platformCommissionPct: number
  driverCommissionPct: number
}
