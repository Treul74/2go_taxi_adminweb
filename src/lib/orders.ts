import { insforge } from './insforge'
import type { OrderDetail, OrderFilters, OrderListResult, OrderListRow, OrderStatus } from '../types/orders'

function assertNoError(error: { message: string } | null, fallback: string) {
  if (error) throw new Error(error.message || fallback)
}

const TAB_STATUSES: Record<OrderFilters['tab'], OrderStatus[] | null> = {
  all: null,
  pending: ['pending'],
  active: ['accepted', 'in_progress'],
  completed: ['completed'],
  cancelled: ['cancelled', 'expired'],
  history: null,
}

const LIST_COLUMNS = `
  id, order_number, status, fare_amount, vehicle_type, created_at,
  customers(first_name, last_name, profile_photo_url),
  drivers(first_name, last_name, profile_photo_url, vehicle_make, vehicle_model)
`.trim()

const DETAIL_COLUMNS = `
  id, order_number, status, fare_amount, vehicle_type, base_fare, distance_fare_amount, time_fare_amount, service_fee_amount,
  pickup_address, pickup_lat, pickup_lng, dropoff_address, dropoff_lat, dropoff_lng,
  trip_distance_km, trip_duration_minutes,
  requested_at, accepted_at, driver_arrived_at, trip_started_at, completed_at, cancelled_at, created_at,
  customers(first_name, last_name, profile_photo_url, phone_number),
  drivers(first_name, last_name, profile_photo_url, vehicle_make, vehicle_model, driver_code, phone_number, rating, license_plate)
`.trim()

interface RawPerson {
  first_name: string
  last_name: string
  profile_photo_url?: string | null
  phone_number?: string | null
}

interface RawDriver extends RawPerson {
  vehicle_make: string | null
  vehicle_model: string | null
  driver_code?: string | null
  rating?: number | null
  license_plate?: string | null
}

interface RawOrderRow {
  id: string
  order_number: number
  status: OrderStatus
  fare_amount: number
  vehicle_type: OrderListRow['vehicleType']
  created_at: string
  customers: RawPerson | null
  drivers: RawDriver | null
}

interface RawOrderDetailRow extends RawOrderRow {
  base_fare: number
  distance_fare_amount: number
  time_fare_amount: number
  service_fee_amount: number
  pickup_address: string | null
  pickup_lat: number | null
  pickup_lng: number | null
  dropoff_address: string | null
  dropoff_lat: number | null
  dropoff_lng: number | null
  trip_distance_km: number | null
  trip_duration_minutes: number | null
  requested_at: string
  accepted_at: string | null
  driver_arrived_at: string | null
  trip_started_at: string | null
  completed_at: string | null
  cancelled_at: string | null
}

function personName(person: RawPerson | null, fallback: string): string {
  if (!person) return fallback
  return `${person.first_name} ${person.last_name}`.trim()
}

function mapListRow(row: RawOrderRow): OrderListRow {
  return {
    id: row.id,
    orderNumber: row.order_number,
    status: row.status,
    customerName: personName(row.customers, 'Unknown customer'),
    customerPhotoUrl: row.customers?.profile_photo_url ?? null,
    driverName: row.drivers ? personName(row.drivers, 'Unassigned') : null,
    driverPhotoUrl: row.drivers?.profile_photo_url ?? null,
    vehicleType: row.vehicle_type,
    vehicleMake: row.drivers?.vehicle_make ?? null,
    vehicleModel: row.drivers?.vehicle_model ?? null,
    fareAmount: Number(row.fare_amount),
    createdAt: row.created_at,
  }
}

function mapDetailRow(row: RawOrderDetailRow): OrderDetail {
  return {
    ...mapListRow(row),
    pickupAddress: row.pickup_address,
    pickupLat: row.pickup_lat,
    pickupLng: row.pickup_lng,
    dropoffAddress: row.dropoff_address,
    dropoffLat: row.dropoff_lat,
    dropoffLng: row.dropoff_lng,
    requestedAt: row.requested_at,
    acceptedAt: row.accepted_at,
    driverArrivedAt: row.driver_arrived_at,
    tripStartedAt: row.trip_started_at,
    completedAt: row.completed_at,
    cancelledAt: row.cancelled_at,
    baseFare: Number(row.base_fare),
    distanceFareAmount: Number(row.distance_fare_amount),
    timeFareAmount: Number(row.time_fare_amount),
    serviceFeeAmount: Number(row.service_fee_amount),
    tripDistanceKm: row.trip_distance_km,
    tripDurationMinutes: row.trip_duration_minutes,
    customerPhone: row.customers?.phone_number ?? null,
    driverPhone: row.drivers?.phone_number ?? null,
    driverCode: row.drivers?.driver_code ?? null,
    driverLicensePlate: row.drivers?.license_plate ?? null,
    driverRating: row.drivers?.rating ?? null,
  }
}

/** Neutralizes PostgREST or-filter syntax characters so free-text search can't inject extra filter clauses. */
function sanitizeSearchTerm(term: string): string {
  return term.replace(/[,()]/g, ' ').trim()
}

async function resolveIdsByName(table: 'customers' | 'drivers', term: string): Promise<string[]> {
  const { data, error } = await insforge.database
    .from(table)
    .select('id')
    .or(`first_name.ilike.%${term}%,last_name.ilike.%${term}%`)
  assertNoError(error, `Unable to search ${table}.`)
  return (data ?? []).map((row) => (row as { id: string }).id)
}

/** Resolves a free-text term to an or-filter across order #, customer name, and driver name. Null means "no match anywhere". */
async function buildSearchOrFilter(term: string): Promise<string | null> {
  const numeric = term.replace(/\D/g, '')
  const [customerIds, driverIds] = await Promise.all([resolveIdsByName('customers', term), resolveIdsByName('drivers', term)])

  const orParts: string[] = []
  if (numeric) orParts.push(`order_number.eq.${numeric}`)
  if (customerIds.length) orParts.push(`customer_id.in.(${customerIds.join(',')})`)
  if (driverIds.length) orParts.push(`driver_id.in.(${driverIds.join(',')})`)

  return orParts.length ? orParts.join(',') : null
}

type OrdersQuery = ReturnType<ReturnType<typeof insforge.database.from>['select']>

/**
 * Resolves the search term to an or-filter string *before* touching the query builder.
 * The builder returned by `insforge.database.from(...)` is thenable (it executes on `await`),
 * so it must never be returned from an `async` function — doing so lets `await` unwrap and
 * run the query prematurely, handing back a result object instead of a further-chainable builder.
 */
async function resolveSearchFilter(search: string): Promise<{ matched: false } | { matched: true; orFilter: string | null }> {
  const term = sanitizeSearchTerm(search)
  if (!term) return { matched: true, orFilter: null }

  const orFilter = await buildSearchOrFilter(term)
  return orFilter ? { matched: true, orFilter } : { matched: false }
}

function applyNonSearchFilters(query: OrdersQuery, filters: Pick<OrderFilters, 'tab' | 'vehicleType' | 'dateFrom' | 'dateTo'>): OrdersQuery {
  let q = query

  const statuses = TAB_STATUSES[filters.tab]
  if (statuses) q = q.in('status', statuses)

  if (filters.vehicleType !== 'all') q = q.eq('vehicle_type', filters.vehicleType)
  if (filters.dateFrom) q = q.gte('created_at', filters.dateFrom.toISOString())
  if (filters.dateTo) q = q.lte('created_at', filters.dateTo.toISOString())

  return q
}

export async function fetchOrders(filters: OrderFilters): Promise<OrderListResult> {
  const search = await resolveSearchFilter(filters.search)
  if (!search.matched) return { rows: [], total: 0 }

  let query = applyNonSearchFilters(insforge.database.from('orders').select(LIST_COLUMNS, { count: 'exact' }) as OrdersQuery, filters)
  if (search.orFilter) query = query.or(search.orFilter)

  const from = (filters.page - 1) * filters.pageSize
  const to = from + filters.pageSize - 1

  const { data, count, error } = await query
    .order(filters.sortBy, { ascending: filters.sortDirection === 'asc' })
    .range(from, to)

  assertNoError(error, 'Unable to load orders.')

  return {
    rows: (data ?? []).map((row) => mapListRow(row as unknown as RawOrderRow)),
    total: count ?? 0,
  }
}

const EXPORT_ROW_LIMIT = 2000

export async function fetchOrdersForExport(filters: Pick<OrderFilters, 'tab' | 'search' | 'vehicleType' | 'dateFrom' | 'dateTo'>): Promise<OrderListRow[]> {
  const search = await resolveSearchFilter(filters.search)
  if (!search.matched) return []

  let query = applyNonSearchFilters(insforge.database.from('orders').select(LIST_COLUMNS) as OrdersQuery, filters)
  if (search.orFilter) query = query.or(search.orFilter)

  const { data, error } = await query.order('created_at', { ascending: false }).limit(EXPORT_ROW_LIMIT)
  assertNoError(error, 'Unable to export orders.')
  return (data ?? []).map((row) => mapListRow(row as unknown as RawOrderRow))
}

export async function fetchOrderDetail(orderId: string): Promise<OrderDetail> {
  const { data, error } = await insforge.database.from('orders').select(DETAIL_COLUMNS).eq('id', orderId).single()

  assertNoError(error, 'Unable to load order detail.')
  return mapDetailRow(data as unknown as RawOrderDetailRow)
}
