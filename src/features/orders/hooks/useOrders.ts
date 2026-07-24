import { useEffect, useMemo, useState } from 'react'
import { usePolledQuery } from '../../../hooks/usePolledQuery'
import { fetchOrders } from '../../../lib/orders'
import type { OrderFilters, OrderTab } from '../../../types/orders'

const PAGE_SIZE = 10

export function useOrders() {
  const [tab, setTab] = useState<OrderTab>('all')
  const [searchInput, setSearchInput] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [vehicleType, setVehicleType] = useState<OrderFilters['vehicleType']>('all')
  const [dateFrom, setDateFrom] = useState<Date | null>(null)
  const [dateTo, setDateTo] = useState<Date | null>(null)
  const [sortDirection, setSortDirection] = useState<OrderFilters['sortDirection']>('desc')
  const [page, setPage] = useState(1)

  useEffect(() => {
    const id = setTimeout(() => setDebouncedSearch(searchInput), 350)
    return () => clearTimeout(id)
  }, [searchInput])

  // Reset to page 1 whenever a filter (not the page itself) changes. Adjusting state during
  // render — rather than in an effect — avoids the extra "stale page" render/fetch cycle
  // (react.dev/learn/you-might-not-need-an-effect#adjusting-some-state-when-a-prop-changes).
  const filterSignature = JSON.stringify([
    tab,
    debouncedSearch,
    vehicleType,
    dateFrom?.getTime() ?? null,
    dateTo?.getTime() ?? null,
    sortDirection,
  ])
  const [prevFilterSignature, setPrevFilterSignature] = useState(filterSignature)
  if (filterSignature !== prevFilterSignature) {
    setPrevFilterSignature(filterSignature)
    setPage(1)
  }

  const filters: OrderFilters = useMemo(
    () => ({
      tab,
      search: debouncedSearch,
      vehicleType,
      dateFrom,
      dateTo,
      sortBy: 'order_number',
      sortDirection,
      page,
      pageSize: PAGE_SIZE,
    }),
    [tab, debouncedSearch, vehicleType, dateFrom, dateTo, sortDirection, page],
  )

  const { data, isLoading, error, refetch } = usePolledQuery(() => fetchOrders(filters), [
    tab,
    debouncedSearch,
    vehicleType,
    dateFrom?.getTime(),
    dateTo?.getTime(),
    sortDirection,
    page,
  ])

  function toggleSort() {
    setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'))
  }

  function setDateRange(from: Date | null, to: Date | null) {
    setDateFrom(from)
    setDateTo(to)
  }

  return {
    rows: data?.rows ?? [],
    total: data?.total ?? 0,
    isLoading,
    error,
    refetch,
    tab,
    setTab,
    searchInput,
    setSearchInput,
    vehicleType,
    setVehicleType,
    dateFrom,
    dateTo,
    setDateRange,
    sortDirection,
    toggleSort,
    page,
    setPage,
    pageSize: PAGE_SIZE,
  }
}
