import { useEffect, useRef } from 'react'
import { usePolledQuery } from '../../../hooks/usePolledQuery'
import { fetchLibraryByCategory, resolveLibraryValue } from '../../../lib/library'

const SEED_ROLES = [
  'Fleet Manager',
  'Regional Supervisor',
  'Support Head',
  'Logistics Lead',
]

export function useManagerRoles() {
  const query = usePolledQuery(() => fetchLibraryByCategory('manager_role'), [])
  const seededRef = useRef(false)

  useEffect(() => {
    if (!query.isLoading && query.data && query.data.length === 0 && !seededRef.current) {
      seededRef.current = true
      Promise.all(SEED_ROLES.map((r) => resolveLibraryValue('manager_role', r)))
        .then(() => void query.refetch())
        .catch(() => {})
    }
  }, [query.data, query.isLoading, query])

  const roles =
    query.data && query.data.length > 0
      ? query.data.map((r) => r.value)
      : SEED_ROLES

  return {
    roles,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  }
}
