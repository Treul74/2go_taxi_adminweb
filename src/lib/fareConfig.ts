import { insforge } from './insforge'
import type { FareConfigInput, FareConfigRow } from '../types/fareConfig'

function assertNoError(error: { message: string } | null, fallback: string) {
  if (error) throw new Error(error.message || fallback)
}

const COLUMNS =
  'id, vehicle_class_id, vehicle_type, base_fare, min_fare, per_km, per_minute, per_minute_waiting, ' +
  'cancellation_fee, night_rate_multiplier, peak_multiplier, platform_commission_pct, driver_commission_pct, ' +
  'is_active, updated_at'

interface RawFareConfig {
  id: string
  vehicle_class_id: string
  vehicle_type: string
  base_fare: number | string
  min_fare: number | string
  per_km: number | string
  per_minute: number | string
  per_minute_waiting: number | string
  cancellation_fee: number | string
  night_rate_multiplier: number | string
  peak_multiplier: number | string
  platform_commission_pct: number | string
  driver_commission_pct: number | string
  is_active: boolean
  updated_at: string
}

function mapRow(row: RawFareConfig): FareConfigRow {
  return {
    id: row.id,
    vehicleClassId: row.vehicle_class_id,
    vehicleType: row.vehicle_type,
    baseFare: Number(row.base_fare),
    minFare: Number(row.min_fare),
    perKm: Number(row.per_km),
    perMinute: Number(row.per_minute),
    perMinuteWaiting: Number(row.per_minute_waiting),
    cancellationFee: Number(row.cancellation_fee),
    nightRateMultiplier: Number(row.night_rate_multiplier),
    peakMultiplier: Number(row.peak_multiplier),
    platformCommissionPct: Number(row.platform_commission_pct),
    driverCommissionPct: Number(row.driver_commission_pct),
    isActive: row.is_active,
    updatedAt: row.updated_at,
  }
}

export async function fetchFareConfigs(): Promise<FareConfigRow[]> {
  const { data, error } = await insforge.database.from('fare_config').select(COLUMNS)
  assertNoError(error, 'Unable to load fare configuration.')
  return (data ?? []).map((row) => mapRow(row as unknown as RawFareConfig))
}

export async function updateFareConfig(vehicleClassId: string, input: FareConfigInput): Promise<FareConfigRow> {
  const { data, error } = await insforge.database
    .from('fare_config')
    .update({
      base_fare: input.baseFare,
      min_fare: input.minFare,
      per_km: input.perKm,
      per_minute: input.perMinute,
      per_minute_waiting: input.perMinuteWaiting,
      cancellation_fee: input.cancellationFee,
      night_rate_multiplier: input.nightRateMultiplier,
      peak_multiplier: input.peakMultiplier,
      platform_commission_pct: input.platformCommissionPct,
      driver_commission_pct: input.driverCommissionPct,
    })
    .eq('vehicle_class_id', vehicleClassId)
    .select(COLUMNS)
    .single()

  assertNoError(error, 'Unable to save fare configuration.')
  return mapRow(data as unknown as RawFareConfig)
}
