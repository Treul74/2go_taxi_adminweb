import { fetchManagerStats } from '../../../lib/managers'
import { usePolledQuery } from '../../../hooks/usePolledQuery'

export function useManagerStats() {
  const { data, isLoading, error, refetch } = usePolledQuery(fetchManagerStats, [], {
    intervalMs: 20000,
  })

  return { stats: data, isLoading, error, refetch }
}
