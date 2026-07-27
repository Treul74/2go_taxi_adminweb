import { useEffect, useMemo, useState } from 'react'
import { usePolledQuery } from '../../../hooks/usePolledQuery'
import { fetchManagers } from '../../../lib/managers'
import type { ManagerFilterPill, ManagerFilters } from '../../../types/managers'

const PAGE_SIZE = 10

export function useManagers() {
  const [searchInput, setSearchInput] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [filterPill, setFilterPill] = useState<ManagerFilterPill>('active')
  const [status, setStatus] = useState<string>('all')
  const [role, setRole] = useState<string>('all')
  const [page, setPage] = useState(1)

  useEffect(() => {
    const id = setTimeout(() => setDebouncedSearch(searchInput), 350)
    return () => clearTimeout(id)
  }, [searchInput])

  const filterSignature = JSON.stringify([debouncedSearch, filterPill, status, role])
  const [prevFilterSignature, setPrevFilterSignature] = useState(filterSignature)
  if (filterSignature !== prevFilterSignature) {
    setPrevFilterSignature(filterSignature)
    setPage(1)
  }

  const filters: ManagerFilters = useMemo(
    () => ({ search: debouncedSearch, filterPill, status, role, page, pageSize: PAGE_SIZE }),
    [debouncedSearch, filterPill, status, role, page],
  )

  const { data, isLoading, error, refetch } = usePolledQuery(
    () => fetchManagers(filters),
    [debouncedSearch, filterPill, status, role, page],
  )

  return {
    rows: data?.rows ?? [],
    total: data?.total ?? 0,
    isLoading,
    error,
    refetch,
    searchInput,
    setSearchInput,
    filterPill,
    setFilterPill,
    status,
    setStatus,
    role,
    setRole,
    page,
    setPage,
    pageSize: PAGE_SIZE,
  }
}
