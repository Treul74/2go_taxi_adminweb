import { useEffect, useMemo, useState } from 'react'
import { usePolledQuery } from '../../../hooks/usePolledQuery'
import { fetchDrivers } from '../../../lib/drivers'
import type { DriverFilters } from '../../../types/drivers'

const PAGE_SIZE = 5

export function useDrivers() {
  const [searchInput, setSearchInput] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [status, setStatus] = useState<DriverFilters['status']>('all')
  const [page, setPage] = useState(1)

  useEffect(() => {
    const id = setTimeout(() => setDebouncedSearch(searchInput), 350)
    return () => clearTimeout(id)
  }, [searchInput])

  // Reset to page 1 whenever a filter (not the page itself) changes. Adjusting state during
  // render — rather than in an effect — avoids the extra "stale page" render/fetch cycle
  // (react.dev/learn/you-might-not-need-an-effect#adjusting-some-state-when-a-prop-changes).
  const filterSignature = JSON.stringify([debouncedSearch, status])
  const [prevFilterSignature, setPrevFilterSignature] = useState(filterSignature)
  if (filterSignature !== prevFilterSignature) {
    setPrevFilterSignature(filterSignature)
    setPage(1)
  }

  const filters: DriverFilters = useMemo(
    () => ({ search: debouncedSearch, status, page, pageSize: PAGE_SIZE }),
    [debouncedSearch, status, page],
  )

  const { data, isLoading, error, refetch } = usePolledQuery(() => fetchDrivers(filters), [debouncedSearch, status, page])

  return {
    rows: data?.rows ?? [],
    total: data?.total ?? 0,
    isLoading,
    error,
    refetch,
    searchInput,
    setSearchInput,
    status,
    setStatus,
    page,
    setPage,
    pageSize: PAGE_SIZE,
  }
}
