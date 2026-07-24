import { insforge } from './insforge'
import type {
  DashboardStats,
  LiveOperations,
  PendingDriverRow,
  RevenuePoint,
  RevenueRange,
  TopDriverRow,
} from '../types/dashboard'

function assertNoError(error: { message: string } | null, fallback: string) {
  if (error) throw new Error(error.message || fallback)
}

type CountQuery = ReturnType<ReturnType<typeof insforge.database.from>['select']>

async function countRows(table: string, build?: (query: CountQuery) => CountQuery) {
  let query = insforge.database.from(table).select('*', { count: 'exact', head: true }) as CountQuery
  if (build) query = build(query)
  const { count, error } = await query
  assertNoError(error, `Unable to load ${table} count.`)
  return count ?? 0
}

function pctChange(current: number, previous: number): number | null {
  if (previous === 0) return null
  return ((current - previous) / previous) * 100
}

export async function fetchDashboardStats(): Promise<DashboardStats> {
  const now = new Date()
  const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString()

  const [
    totalCustomers,
    customersThisMonth,
    customersLastMonth,
    totalOrders,
    ordersThisMonth,
    ordersLastMonth,
    activeOrders,
    totalDrivers,
    activeDriversNow,
    pendingApprovals,
    revenueRows,
  ] = await Promise.all([
    countRows('customers'),
    countRows('customers', (q) => q.gte('created_at', startOfThisMonth)),
    countRows('customers', (q) => q.gte('created_at', startOfLastMonth).lt('created_at', startOfThisMonth)),
    countRows('orders'),
    countRows('orders', (q) => q.gte('created_at', startOfThisMonth)),
    countRows('orders', (q) => q.gte('created_at', startOfLastMonth).lt('created_at', startOfThisMonth)),
    countRows('orders', (q) => q.in('status', ['accepted', 'in_progress'])),
    countRows('drivers'),
    countRows('drivers', (q) => q.eq('driver_status', 'active')),
    countRows('drivers', (q) => q.eq('account_status', 'pending')),
    insforge.database
      .from('orders')
      .select('fare_amount')
      .eq('status', 'completed')
      .gte('completed_at', startOfThisMonth),
  ])

  assertNoError(revenueRows.error, 'Unable to load revenue.')
  const totalRevenueThisMonth = (revenueRows.data ?? []).reduce(
    (sum, row) => sum + Number((row as { fare_amount: number }).fare_amount ?? 0),
    0,
  )

  return {
    totalCustomers,
    customerGrowthPct: pctChange(customersThisMonth, customersLastMonth),
    totalOrders,
    orderGrowthPct: pctChange(ordersThisMonth, ordersLastMonth),
    activeOrders,
    totalDrivers,
    activeDriversNow,
    totalRevenueThisMonth,
    pendingApprovals,
  }
}

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

function endOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999)
}

export function buildRevenueRange(preset: RevenueRange['preset'], custom?: { from: Date; to: Date }): RevenueRange {
  const now = new Date()

  if (preset === 'today') {
    return { preset, from: startOfDay(now), to: endOfDay(now) }
  }

  if (preset === 'week') {
    const day = now.getDay()
    const mondayOffset = day === 0 ? -6 : 1 - day
    const monday = new Date(now.getFullYear(), now.getMonth(), now.getDate() + mondayOffset)
    const sunday = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + 6)
    return { preset, from: startOfDay(monday), to: endOfDay(sunday) }
  }

  if (preset === 'month') {
    const first = new Date(now.getFullYear(), now.getMonth(), 1)
    const last = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    return { preset, from: startOfDay(first), to: endOfDay(last) }
  }

  if (!custom) throw new Error('Custom range requires from/to dates.')
  return { preset, from: startOfDay(custom.from), to: endOfDay(custom.to) }
}

const WEEKDAY_LABELS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']

export async function fetchRevenueSeries(range: RevenueRange): Promise<RevenuePoint[]> {
  const { data, error } = await insforge.database
    .from('orders')
    .select('fare_amount, completed_at')
    .eq('status', 'completed')
    .gte('completed_at', range.from.toISOString())
    .lte('completed_at', range.to.toISOString())

  assertNoError(error, 'Unable to load revenue series.')
  const rows = (data ?? []) as { fare_amount: number; completed_at: string }[]

  const isHourly = range.preset === 'today'
  const buckets = new Map<string, RevenuePoint>()

  if (isHourly) {
    for (let hour = 0; hour < 24; hour += 1) {
      const key = String(hour)
      buckets.set(key, { key, label: `${hour}:00`, revenue: 0 })
    }
  } else {
    const cursor = new Date(range.from)
    while (cursor <= range.to) {
      const key = cursor.toISOString().slice(0, 10)
      const label = range.preset === 'week' ? WEEKDAY_LABELS[cursor.getDay()] : String(cursor.getDate())
      buckets.set(key, { key, label, revenue: 0 })
      cursor.setDate(cursor.getDate() + 1)
    }
  }

  for (const row of rows) {
    const completedAt = new Date(row.completed_at)
    const key = isHourly ? String(completedAt.getHours()) : completedAt.toISOString().slice(0, 10)
    const bucket = buckets.get(key)
    if (bucket) bucket.revenue += Number(row.fare_amount ?? 0)
  }

  return Array.from(buckets.values())
}

export async function fetchPendingDrivers(limit = 5): Promise<PendingDriverRow[]> {
  const { data, error } = await insforge.database
    .from('drivers')
    .select(
      'id, first_name, last_name, email, phone_number, profile_photo_url, vehicle_make, vehicle_model, vehicle_year, vehicle_class, license_plate, drivers_license_url, vehicle_registration_url, insurance_certificate_url, created_at',
    )
    .eq('account_status', 'pending')
    .order('created_at', { ascending: false })
    .limit(limit)

  assertNoError(error, 'Unable to load pending drivers.')
  return (data ?? []).map((row) => ({
    id: row.id,
    firstName: row.first_name,
    lastName: row.last_name,
    email: row.email,
    phoneNumber: row.phone_number,
    profilePhotoUrl: row.profile_photo_url,
    vehicleMake: row.vehicle_make,
    vehicleModel: row.vehicle_model,
    vehicleYear: row.vehicle_year,
    vehicleClass: row.vehicle_class,
    licensePlate: row.license_plate,
    driversLicenseUrl: row.drivers_license_url,
    vehicleRegistrationUrl: row.vehicle_registration_url,
    insuranceCertificateUrl: row.insurance_certificate_url,
    createdAt: row.created_at,
  }))
}

export async function fetchTopDrivers(limit = 3): Promise<TopDriverRow[]> {
  const { data, error } = await insforge.database
    .from('drivers')
    .select(
      'id, first_name, last_name, profile_photo_url, vehicle_make, vehicle_model, vehicle_year, rating, total_earnings, driver_status',
    )
    .eq('account_status', 'approved')
    .order('total_completed_rides', { ascending: false })
    .limit(limit)

  assertNoError(error, 'Unable to load top drivers.')
  return (data ?? []).map((row) => ({
    id: row.id,
    firstName: row.first_name,
    lastName: row.last_name,
    profilePhotoUrl: row.profile_photo_url,
    vehicleMake: row.vehicle_make,
    vehicleModel: row.vehicle_model,
    vehicleYear: row.vehicle_year,
    rating: Number(row.rating ?? 0),
    totalEarnings: Number(row.total_earnings ?? 0),
    driverStatus: row.driver_status,
  }))
}

export async function fetchLiveOperations(): Promise<LiveOperations> {
  const { data, error } = await insforge.database
    .from('drivers')
    .select('id, first_name, last_name, driver_status, current_lat, current_lng')
    .eq('account_status', 'approved')

  assertNoError(error, 'Unable to load live operations.')
  const rows = data ?? []

  const drivers = rows.map((row) => ({
    id: row.id,
    firstName: row.first_name,
    lastName: row.last_name,
    driverStatus: row.driver_status,
    currentLat: row.current_lat,
    currentLng: row.current_lng,
  }))

  return {
    active: drivers.filter((d) => d.driverStatus === 'active').length,
    idle: drivers.filter((d) => d.driverStatus === 'idle').length,
    offline: drivers.filter((d) => d.driverStatus === 'offline').length,
    drivers,
  }
}

export async function approveDriver(driverId: string) {
  const { error } = await insforge.database
    .from('drivers')
    .update({ account_status: 'approved' })
    .eq('id', driverId)
  assertNoError(error, 'Unable to approve driver.')
}

export async function rejectDriver(driverId: string) {
  const { error } = await insforge.database
    .from('drivers')
    .update({ account_status: 'rejected' })
    .eq('id', driverId)
  assertNoError(error, 'Unable to reject driver.')
}
