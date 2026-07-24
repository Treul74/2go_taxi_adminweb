import { fetchDriverStats } from '../../../lib/drivers'
import { usePolledQuery } from '../../../hooks/usePolledQuery'

export function useDriverStats() {
  const { data, isLoading, error, refetch } = usePolledQuery(fetchDriverStats, [], {
    intervalMs: 20000,
  })

  return { stats: data, isLoading, error, refetch }
}
