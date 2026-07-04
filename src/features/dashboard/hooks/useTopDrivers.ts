import { fetchTopDrivers } from '../../../lib/dashboard'
import { usePolledQuery } from '../../../hooks/usePolledQuery'

export function useTopDrivers(limit = 3) {
  const { data, isLoading, error, refetch } = usePolledQuery(() => fetchTopDrivers(limit), [limit], {
    intervalMs: 30000,
  })

  return { drivers: data ?? [], isLoading, error, refetch }
}
