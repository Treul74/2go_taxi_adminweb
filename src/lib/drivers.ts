import { insforge } from './insforge'
import type { DriverAccountStatus, DriverFilters, DriverListResult, DriverListRow, DriverStats } from '../types/drivers'

function assertNoError(error: { message: string } | null, fallback: string) {
  if (error) throw new Error(error.message || fallback)
}

const LIST_COLUMNS = 'id, driver_code, first_name, last_name, email, profile_photo_url, vehicle_type, account_status, created_at'

interface RawDriverRow {
  id: string
  driver_code: string
  first_name: string
  last_name: string
  email: string
  profile_photo_url: string | null
  vehicle_type: DriverListRow['vehicleType']
  account_status: DriverAccountStatus
  created_at: string
}

function mapRow(row: RawDriverRow): DriverListRow {
  return {
    id: row.id,
    driverCode: row.driver_code,
    firstName: row.first_name,
    lastName: row.last_name,
    email: row.email,
    profilePhotoUrl: row.profile_photo_url,
    vehicleType: row.vehicle_type,
    accountStatus: row.account_status,
    createdAt: row.created_at,
  }
}

/** Neutralizes PostgREST or-filter syntax characters so free-text search can't inject extra filter clauses. */
function sanitizeSearchTerm(term: string): string {
  return term.replace(/[,()]/g, ' ').trim()
}

type DriversQuery = ReturnType<ReturnType<typeof insforge.database.from>['select']>

function applyCommonFilters(query: DriversQuery, filters: Pick<DriverFilters, 'search' | 'status'>): DriversQuery {
  let q = query

  if (filters.status !== 'all') q = q.eq('account_status', filters.status)

  const term = sanitizeSearchTerm(filters.search)
  if (term) {
    q = q.or(
      [
        `first_name.ilike.%${term}%`,
        `last_name.ilike.%${term}%`,
        `email.ilike.%${term}%`,
        `driver_code.ilike.%${term}%`,
      ].join(','),
    )
  }

  return q
}

export async function fetchDriverStats(): Promise<DriverStats> {
  const [totalRes, activeRes, pendingRes, ratingRes] = await Promise.all([
    insforge.database.from('drivers').select('id', { count: 'exact', head: true }),
    insforge.database.from('drivers').select('id', { count: 'exact', head: true }).eq('driver_status', 'online'),
    insforge.database.from('drivers').select('id', { count: 'exact', head: true }).eq('account_status', 'pending'),
    insforge.database.from('drivers').select('rating'),
  ])

  assertNoError(totalRes.error, 'Unable to load driver stats.')
  assertNoError(activeRes.error, 'Unable to load driver stats.')
  assertNoError(pendingRes.error, 'Unable to load driver stats.')
  assertNoError(ratingRes.error, 'Unable to load driver stats.')

  const ratings = (ratingRes.data ?? []) as { rating: number }[]
  const fleetRating = ratings.length === 0 ? 0 : ratings.reduce((sum, row) => sum + Number(row.rating ?? 0), 0) / ratings.length

  return {
    total: totalRes.count ?? 0,
    activeNow: activeRes.count ?? 0,
    pendingApproval: pendingRes.count ?? 0,
    fleetRating,
  }
}

export async function fetchDrivers(filters: DriverFilters): Promise<DriverListResult> {
  const from = (filters.page - 1) * filters.pageSize
  const to = from + filters.pageSize - 1

  const query = applyCommonFilters(
    insforge.database.from('drivers').select(LIST_COLUMNS, { count: 'exact' }) as DriversQuery,
    filters,
  )
    .order('created_at', { ascending: false })
    .range(from, to)

  const { data, count, error } = await query
  assertNoError(error, 'Unable to load drivers.')

  return {
    rows: (data ?? []).map((row) => mapRow(row as unknown as RawDriverRow)),
    total: count ?? 0,
  }
}

const EXPORT_ROW_LIMIT = 2000

export async function fetchDriversForExport(filters: Pick<DriverFilters, 'search' | 'status'>): Promise<DriverListRow[]> {
  const query = applyCommonFilters(
    insforge.database.from('drivers').select(LIST_COLUMNS) as DriversQuery,
    filters,
  )
    .order('created_at', { ascending: false })
    .limit(EXPORT_ROW_LIMIT)

  const { data, error } = await query
  assertNoError(error, 'Unable to export drivers.')
  return (data ?? []).map((row) => mapRow(row as unknown as RawDriverRow))
}

export async function updateDriverAccountStatus(driverId: string, status: DriverAccountStatus): Promise<void> {
  const { error } = await insforge.database.from('drivers').update({ account_status: status }).eq('id', driverId)
  assertNoError(error, 'Unable to update driver status.')
}
