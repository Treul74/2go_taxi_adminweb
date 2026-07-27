import { insforge } from './insforge'
import type {
  ManagerFilters,
  ManagerListResult,
  ManagerRow,
  ManagerStats,
  ManagerStatus,
  ManagerInput,
} from '../types/managers'

function assertNoError(error: { message: string } | null, fallback: string) {
  if (error) throw new Error(error.message || fallback)
}

const MANAGER_COLUMNS = 'id, auth_id, full_name, email, role, province, district, account_status, last_login_at, created_at'

interface RawManagerRow {
  id: string
  auth_id: string
  full_name: string
  email: string
  role: string | null
  province: string | null
  district: string | null
  account_status: ManagerStatus
  last_login_at: string | null
  created_at: string
}

function mapRow(row: RawManagerRow): ManagerRow {
  return {
    id: row.id,
    authId: row.auth_id,
    fullName: row.full_name,
    email: row.email,
    role: row.role,
    province: row.province,
    district: row.district,
    status: row.account_status,
    lastLoginAt: row.last_login_at,
    createdAt: row.created_at,
  }
}

function sanitizeSearchTerm(term: string): string {
  return term.replace(/[,()]/g, ' ').trim()
}

type ManagersQuery = ReturnType<ReturnType<typeof insforge.database.from>['select']>

function applyCommonFilters(
  query: ManagersQuery,
  filters: Pick<ManagerFilters, 'search' | 'filterPill' | 'status' | 'role'>,
): ManagersQuery {
  let q = query

  if (filters.filterPill === 'fleet_only') {
    q = q.ilike('role', '%Fleet%')
  } else if (filters.filterPill === 'approved') {
    q = q.eq('account_status', 'approved')
  }

  if (filters.status && filters.status !== 'all') {
    q = q.eq('account_status', filters.status)
  }
  if (filters.role && filters.role !== 'all') {
    q = q.eq('role', filters.role)
  }

  const term = sanitizeSearchTerm(filters.search)
  if (term) {
    q = q.or(
      [
        `full_name.ilike.%${term}%`,
        `email.ilike.%${term}%`,
        `role.ilike.%${term}%`,
        `province.ilike.%${term}%`,
        `district.ilike.%${term}%`,
      ].join(','),
    )
  }

  return q
}

export async function fetchManagerStats(): Promise<ManagerStats> {
  const [totalRes, approvedRowsRes, pendingRes] = await Promise.all([
    insforge.database.from('admins').select('id', { count: 'exact', head: true }),
    insforge.database.from('admins').select('province, last_login_at').eq('account_status', 'approved'),
    insforge.database.from('admins').select('id', { count: 'exact', head: true }).eq('account_status', 'pending'),
  ])

  assertNoError(totalRes.error, 'Unable to load manager stats.')
  assertNoError(approvedRowsRes.error, 'Unable to load manager stats.')
  assertNoError(pendingRes.error, 'Unable to load manager stats.')

  const approvedRows = (approvedRowsRes.data ?? []) as { province: string | null; last_login_at: string | null }[]

  const now = Date.now()
  const twentyFourHoursAgo = now - 24 * 60 * 60 * 1000
  const currentlyOnline = approvedRows.filter((r) => {
    if (!r.last_login_at) return false
    return new Date(r.last_login_at).getTime() >= twentyFourHoursAgo
  }).length

  const activeRegions = new Set(approvedRows.map((r) => r.province).filter(Boolean)).size

  return {
    totalManagers: totalRes.count ?? 0,
    currentlyOnline,
    activeRegions,
    pendingApproval: pendingRes.count ?? 0,
  }
}

export async function fetchManagers(filters: ManagerFilters): Promise<ManagerListResult> {
  const from = (filters.page - 1) * filters.pageSize
  const to = from + filters.pageSize - 1

  const query = applyCommonFilters(
    insforge.database.from('admins').select(MANAGER_COLUMNS, { count: 'exact' }) as ManagersQuery,
    filters,
  )
    .order('created_at', { ascending: false })
    .range(from, to)

  const { data, count, error } = await query
  assertNoError(error, 'Unable to load managers.')

  return {
    rows: (data ?? []).map((row) => mapRow(row as unknown as RawManagerRow)),
    total: count ?? 0,
  }
}

const EXPORT_ROW_LIMIT = 2000

export async function fetchManagersForExport(
  filters: Pick<ManagerFilters, 'search' | 'filterPill' | 'status' | 'role'>,
): Promise<ManagerRow[]> {
  const query = applyCommonFilters(
    insforge.database.from('admins').select(MANAGER_COLUMNS) as ManagersQuery,
    filters,
  )
    .order('created_at', { ascending: false })
    .limit(EXPORT_ROW_LIMIT)

  const { data, error } = await query
  assertNoError(error, 'Unable to export managers.')
  return (data ?? []).map((row) => mapRow(row as unknown as RawManagerRow))
}

export async function updateManagerStatus(id: string, status: ManagerStatus): Promise<void> {
  const { error } = await insforge.database.from('admins').update({ account_status: status }).eq('id', id)
  assertNoError(error, 'Unable to update manager status.')
}

export async function createManager(input: ManagerInput): Promise<ManagerRow> {
  const tempPassword = Math.random().toString(36).slice(-10) + 'A1!'
  const { data: signUpData, error: signUpError } = await insforge.auth.signUp({
    email: input.email,
    password: tempPassword,
    name: input.fullName,
  })

  if (signUpError) {
    throw new Error(signUpError.message || 'Unable to create the manager login.')
  }

  const authId = signUpData?.user?.id
  if (!authId) {
    throw new Error('Unable to create the manager login.')
  }

  await insforge.auth.sendResetPasswordEmail({ email: input.email }).catch(() => {})

  const { data, error } = await insforge.database
    .from('admins')
    .insert([
      {
        auth_id: authId,
        full_name: input.fullName,
        email: input.email,
        role: input.role,
        province: input.province,
        district: input.district,
        account_status: 'approved',
      },
    ])
    .select(MANAGER_COLUMNS)
    .single()

  assertNoError(error, 'Unable to create manager.')
  return mapRow(data as unknown as RawManagerRow)
}
