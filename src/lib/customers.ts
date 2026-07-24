import { insforge } from './insforge'
import type {
  CustomerAccountStatus,
  CustomerDetail,
  CustomerFilters,
  CustomerListResult,
  CustomerListRow,
  CustomerRideHistoryItem,
  CustomerStats,
} from '../types/customers'

function assertNoError(error: { message: string } | null, fallback: string) {
  if (error) throw new Error(error.message || fallback)
}

const LIST_COLUMNS =
  'id, first_name, last_name, email, phone_number, country_code, profile_photo_url, account_status, wallet_balance, total_completed_rides, created_at, updated_at'

const DETAIL_COLUMNS = `${LIST_COLUMNS}, rating, total_ratings, preferred_payment_method`

interface RawCustomerRow {
  id: string
  first_name: string | null
  last_name: string | null
  email: string | null
  phone_number: string | null
  country_code: string | null
  profile_photo_url: string | null
  account_status: CustomerAccountStatus
  wallet_balance: number
  total_completed_rides: number
  created_at: string
  updated_at: string
}

interface RawCustomerDetailRow extends RawCustomerRow {
  rating: number
  total_ratings: number
  preferred_payment_method: string | null
}

interface RawOrderRow {
  id: string
  pickup_address: string | null
  dropoff_address: string | null
  fare_amount: number
  status: string
  created_at: string
}

function mapRow(row: RawCustomerRow): CustomerListRow {
  return {
    id: row.id,
    firstName: row.first_name,
    lastName: row.last_name,
    email: row.email,
    phoneNumber: row.phone_number,
    countryCode: row.country_code,
    profilePhotoUrl: row.profile_photo_url,
    accountStatus: row.account_status,
    walletBalance: Number(row.wallet_balance),
    totalCompletedRides: row.total_completed_rides,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

function mapDetailRow(row: RawCustomerDetailRow): CustomerDetail {
  return {
    ...mapRow(row),
    rating: Number(row.rating),
    totalRatings: row.total_ratings,
    preferredPaymentMethod: row.preferred_payment_method,
  }
}

function mapRideHistoryRow(row: RawOrderRow): CustomerRideHistoryItem {
  return {
    id: row.id,
    pickupAddress: row.pickup_address,
    dropoffAddress: row.dropoff_address,
    fareAmount: Number(row.fare_amount),
    status: row.status,
    createdAt: row.created_at,
  }
}

/** Neutralizes PostgREST or-filter syntax characters so free-text search can't inject extra filter clauses. */
function sanitizeSearchTerm(term: string): string {
  return term.replace(/[,()]/g, ' ').trim()
}

const SORT_COLUMN: Record<CustomerFilters['sort'], string> = {
  recent_activity: 'updated_at',
  join_date: 'created_at',
  wallet_balance: 'wallet_balance',
}

type CustomersQuery = ReturnType<ReturnType<typeof insforge.database.from>['select']>

function applyCommonFilters(query: CustomersQuery, filters: Pick<CustomerFilters, 'search' | 'status'>): CustomersQuery {
  let q = query

  if (filters.status !== 'all') q = q.eq('account_status', filters.status)

  const term = sanitizeSearchTerm(filters.search)
  if (term) {
    q = q.or(
      [
        `first_name.ilike.%${term}%`,
        `last_name.ilike.%${term}%`,
        `email.ilike.%${term}%`,
        `phone_number.ilike.%${term}%`,
      ].join(','),
    )
  }

  return q
}

export async function fetchCustomerStats(): Promise<CustomerStats> {
  const statusCount = (status: CustomerAccountStatus) =>
    insforge.database.from('customers').select('id', { count: 'exact', head: true }).eq('account_status', status)

  const [totalRes, activeRes, suspendedRes, deletedRes] = await Promise.all([
    insforge.database.from('customers').select('id', { count: 'exact', head: true }),
    statusCount('active'),
    statusCount('suspended'),
    statusCount('deleted'),
  ])

  assertNoError(totalRes.error, 'Unable to load customer stats.')
  assertNoError(activeRes.error, 'Unable to load customer stats.')
  assertNoError(suspendedRes.error, 'Unable to load customer stats.')
  assertNoError(deletedRes.error, 'Unable to load customer stats.')

  return {
    total: totalRes.count ?? 0,
    active: activeRes.count ?? 0,
    suspended: suspendedRes.count ?? 0,
    deleted: deletedRes.count ?? 0,
  }
}

export async function fetchCustomers(filters: CustomerFilters): Promise<CustomerListResult> {
  const from = (filters.page - 1) * filters.pageSize
  const to = from + filters.pageSize - 1

  const query = applyCommonFilters(
    insforge.database.from('customers').select(LIST_COLUMNS, { count: 'exact' }) as CustomersQuery,
    filters,
  )
    .order(SORT_COLUMN[filters.sort], { ascending: false })
    .range(from, to)

  const { data, count, error } = await query
  assertNoError(error, 'Unable to load customers.')

  return {
    rows: (data ?? []).map((row) => mapRow(row as unknown as RawCustomerRow)),
    total: count ?? 0,
  }
}

const EXPORT_ROW_LIMIT = 2000

export async function fetchCustomersForExport(filters: Pick<CustomerFilters, 'search' | 'status'>): Promise<CustomerListRow[]> {
  const query = applyCommonFilters(
    insforge.database.from('customers').select(LIST_COLUMNS) as CustomersQuery,
    filters,
  )
    .order('created_at', { ascending: false })
    .limit(EXPORT_ROW_LIMIT)

  const { data, error } = await query
  assertNoError(error, 'Unable to export customers.')
  return (data ?? []).map((row) => mapRow(row as unknown as RawCustomerRow))
}

export async function fetchCustomerDetail(customerId: string): Promise<CustomerDetail> {
  const { data, error } = await insforge.database
    .from('customers')
    .select(DETAIL_COLUMNS)
    .eq('id', customerId)
    .single()

  assertNoError(error, 'Unable to load customer detail.')
  return mapDetailRow(data as unknown as RawCustomerDetailRow)
}

export async function fetchCustomerRideHistory(customerId: string, limit = 5): Promise<CustomerRideHistoryItem[]> {
  const { data, error } = await insforge.database
    .from('orders')
    .select('id, pickup_address, dropoff_address, fare_amount, status, created_at')
    .eq('customer_id', customerId)
    .order('created_at', { ascending: false })
    .limit(limit)

  assertNoError(error, 'Unable to load ride history.')
  return (data ?? []).map((row) => mapRideHistoryRow(row as unknown as RawOrderRow))
}

export async function updateCustomerStatus(customerId: string, status: CustomerAccountStatus): Promise<void> {
  const { error } = await insforge.database.from('customers').update({ account_status: status }).eq('id', customerId)
  assertNoError(error, 'Unable to update customer status.')
}
