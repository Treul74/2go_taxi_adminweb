import { insforge } from './insforge'
import type { OrderDetail, OrderFilters, OrderListResult, OrderListRow, OrderStatus } from '../types/orders'

function assertNoError(error: { message: string } | null, fallback: string) {
  if (error) throw new Error(error.message || fallback)
}

const TAB_STATUSES: Record<OrderFilters['tab'], OrderStatus[] | null> = {
  pending: ['pending'],
  active: ['accepted', 'in_progress'],
  completed: ['completed'],
  cancelled: ['cancelled'],
  history: null,
}

const LIST_COLUMNS = `
  id, order_number, status, fare_amount, created_at,
  customers(first_name, last_name, profile_photo_url),
  drivers(first_name, last_name, vehicle_make, vehicle_model, vehicle_class)
`.trim()

const DETAIL_COLUMNS = `
  id, order_number, status, fare_amount, base_fare, service_fee_pct, service_fee_amount,
  pickup_address, pickup_lat, pickup_lng, dropoff_address, dropoff_lat, dropoff_lng,
  payment_method, requested_at, completed_at, created_at,
  customers(first_name, last_name, profile_photo_url, rating),
  drivers(first_name, last_name, vehicle_make, vehicle_model, vehicle_class, license_plate, rating, current_lat, current_lng)
`.trim()

interface RawPerson {
  first_name: string
  last_name: string
  profile_photo_url?: string | null
  rating?: number | null
}

interface RawDriver extends RawPerson {
  vehicle_make: string | null
  vehicle_model: string | null
  vehicle_class: string | null
  license_plate?: string | null
  current_lat?: number | null
  current_lng?: number | null
}

interface RawOrderRow {
  id: string
  order_number: number
  status: OrderStatus
  fare_amount: number
  created_at: string
  customers: RawPerson | null
  drivers: RawDriver | null
}

interface RawOrderDetailRow extends RawOrderRow {
  base_fare: number
  service_fee_pct: number
  service_fee_amount: number
  pickup_address: string | null
  pickup_lat: number | null
  pickup_lng: number | null
  dropoff_address: string | null
  dropoff_lat: number | null
  dropoff_lng: number | null
  payment_method: string | null
  requested_at: string
  completed_at: string | null
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
    vehicleClass: row.drivers?.vehicle_class ?? null,
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
    paymentMethod: row.payment_method,
    requestedAt: row.requested_at,
    completedAt: row.completed_at,
    baseFare: Number(row.base_fare),
    serviceFeePct: Number(row.service_fee_pct),
    serviceFeeAmount: Number(row.service_fee_amount),
    customerRating: row.customers?.rating ?? null,
    driverRating: row.drivers?.rating ?? null,
    driverLicensePlate: row.drivers?.license_plate ?? null,
    driverCurrentLat: row.drivers?.current_lat ?? null,
    driverCurrentLng: row.drivers?.current_lng ?? null,
  }
}

/** Neutralizes PostgREST or-filter syntax characters so free-text search can't inject extra filter clauses. */
function sanitizeSearchTerm(term: string): string {
  return term.replace(/[,()]/g, ' ').trim()
}

async function resolveDriverIdsForVehicleClass(vehicleClass: string): Promise<string[]> {
  const { data, error } = await insforge.database.from('drivers').select('id').eq('vehicle_class', vehicleClass)
  assertNoError(error, 'Unable to filter by vehicle class.')
  return (data ?? []).map((row) => (row as { id: string }).id)
}

type OrdersQuery = ReturnType<ReturnType<typeof insforge.database.from>['select']>

type CommonFilters = Pick<OrderFilters, 'tab' | 'search' | 'dateFrom' | 'dateTo'>

function applyCommonFilters(query: OrdersQuery, filters: CommonFilters): OrdersQuery {
  let q = query

  const statuses = TAB_STATUSES[filters.tab]
  if (statuses) q = q.in('status', statuses)

  if (filters.dateFrom) q = q.gte('created_at', filters.dateFrom.toISOString())
  if (filters.dateTo) q = q.lte('created_at', filters.dateTo.toISOString())

  const term = sanitizeSearchTerm(filters.search)
  if (term) {
    const orParts = [`pickup_address.ilike.%${term}%`, `dropoff_address.ilike.%${term}%`]
    const numeric = term.replace(/\D/g, '')
    if (numeric) orParts.push(`order_number.eq.${numeric}`)
    q = q.or(orParts.join(','))
  }

  return q
}

export async function fetchOrders(filters: OrderFilters): Promise<OrderListResult> {
  let query = applyCommonFilters(
    insforge.database.from('orders').select(LIST_COLUMNS, { count: 'exact' }) as OrdersQuery,
    filters,
  )

  if (filters.vehicleClass !== 'all') {
    const driverIds = await resolveDriverIdsForVehicleClass(filters.vehicleClass)
    if (driverIds.length === 0) return { rows: [], total: 0 }
    query = query.in('driver_id', driverIds)
  }

  const from = (filters.page - 1) * filters.pageSize
  const to = from + filters.pageSize - 1

  query = query.order(filters.sortBy, { ascending: filters.sortDirection === 'asc' }).range(from, to)

  const { data, count, error } = await query
  assertNoError(error, 'Unable to load orders.')

  return {
    rows: (data ?? []).map((row) => mapListRow(row as unknown as RawOrderRow)),
    total: count ?? 0,
  }
}

const EXPORT_ROW_LIMIT = 2000

export async function fetchOrdersForExport(filters: CommonFilters): Promise<OrderListRow[]> {
  const query = applyCommonFilters(
    insforge.database.from('orders').select(LIST_COLUMNS) as OrdersQuery,
    filters,
  ).order('created_at', { ascending: false }).limit(EXPORT_ROW_LIMIT)

  const { data, error } = await query
  assertNoError(error, 'Unable to export orders.')
  return (data ?? []).map((row) => mapListRow(row as unknown as RawOrderRow))
}

export async function fetchOrderDetail(orderId: string): Promise<OrderDetail> {
  const { data, error } = await insforge.database
    .from('orders')
    .select(DETAIL_COLUMNS)
    .eq('id', orderId)
    .single()

  assertNoError(error, 'Unable to load order detail.')
  return mapDetailRow(data as unknown as RawOrderDetailRow)
}

export async function updateOrderStatus(orderId: string, status: OrderStatus) {
  const { error } = await insforge.database.from('orders').update({ status }).eq('id', orderId)
  assertNoError(error, 'Unable to update order.')
}
