import { useEffect, useMemo, useState } from 'react'
import { usePolledQuery } from '../../../hooks/usePolledQuery'
import { fetchOrders } from '../../../lib/orders'
import type { OrderFilters, OrderSortColumn, OrderTab, SortDirection } from '../../../types/orders'

const PAGE_SIZE = 10

export function useOrders() {
  const [tab, setTab] = useState<OrderTab>('active')
  const [searchInput, setSearchInput] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [vehicleClass, setVehicleClass] = useState<OrderFilters['vehicleClass']>('all')
  const [dateFrom, setDateFrom] = useState<Date | null>(null)
  const [dateTo, setDateTo] = useState<Date | null>(null)
  const [sortBy, setSortBy] = useState<OrderSortColumn>('created_at')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
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
    vehicleClass,
    dateFrom?.getTime() ?? null,
    dateTo?.getTime() ?? null,
    sortBy,
    sortDirection,
  ])
  const [prevFilterSignature, setPrevFilterSignature] = useState(filterSignature)
  if (filterSignature !== prevFilterSignature) {
    setPrevFilterSignature(filterSignature)
    setPage(1)
  }

  const filters: OrderFilters = useMemo(
    () => ({ tab, search: debouncedSearch, vehicleClass, dateFrom, dateTo, sortBy, sortDirection, page, pageSize: PAGE_SIZE }),
    [tab, debouncedSearch, vehicleClass, dateFrom, dateTo, sortBy, sortDirection, page],
  )

  const { data, isLoading, error, refetch } = usePolledQuery(() => fetchOrders(filters), [
    tab,
    debouncedSearch,
    vehicleClass,
    dateFrom?.getTime(),
    dateTo?.getTime(),
    sortBy,
    sortDirection,
    page,
  ])

  function toggleSort(column: OrderSortColumn) {
    if (sortBy === column) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortBy(column)
      setSortDirection('desc')
    }
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
    vehicleClass,
    setVehicleClass,
    dateFrom,
    dateTo,
    setDateRange,
    sortBy,
    sortDirection,
    toggleSort,
    page,
    setPage,
    pageSize: PAGE_SIZE,
  }
}
