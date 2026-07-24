import { useEffect, useMemo, useState } from 'react'
import { usePolledQuery } from '../../../hooks/usePolledQuery'
import { fetchCustomers } from '../../../lib/customers'
import type { CustomerFilters, CustomerSortOption } from '../../../types/customers'

const PAGE_SIZE = 10

export function useCustomers() {
  const [searchInput, setSearchInput] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [status, setStatus] = useState<CustomerFilters['status']>('all')
  const [sort, setSort] = useState<CustomerSortOption>('recent_activity')
  const [page, setPage] = useState(1)

  useEffect(() => {
    const id = setTimeout(() => setDebouncedSearch(searchInput), 350)
    return () => clearTimeout(id)
  }, [searchInput])

  // Reset to page 1 whenever a filter (not the page itself) changes. Adjusting state during
  // render — rather than in an effect — avoids the extra "stale page" render/fetch cycle
  // (react.dev/learn/you-might-not-need-an-effect#adjusting-some-state-when-a-prop-changes).
  const filterSignature = JSON.stringify([debouncedSearch, status, sort])
  const [prevFilterSignature, setPrevFilterSignature] = useState(filterSignature)
  if (filterSignature !== prevFilterSignature) {
    setPrevFilterSignature(filterSignature)
    setPage(1)
  }

  const filters: CustomerFilters = useMemo(
    () => ({ search: debouncedSearch, status, sort, page, pageSize: PAGE_SIZE }),
    [debouncedSearch, status, sort, page],
  )

  const { data, isLoading, error, refetch } = usePolledQuery(() => fetchCustomers(filters), [
    debouncedSearch,
    status,
    sort,
    page,
  ])

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
    sort,
    setSort,
    page,
    setPage,
    pageSize: PAGE_SIZE,
  }
}
