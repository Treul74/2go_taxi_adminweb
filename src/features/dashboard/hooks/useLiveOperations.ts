import { fetchLiveOperations } from '../../../lib/dashboard'
import { usePolledQuery } from '../../../hooks/usePolledQuery'

export function useLiveOperations() {
  const { data, isLoading, error, refetch } = usePolledQuery(fetchLiveOperations, [], {
    intervalMs: 10000,
  })

  return {
    active: data?.active ?? 0,
    idle: data?.idle ?? 0,
    offline: data?.offline ?? 0,
    drivers: data?.drivers ?? [],
    isLoading,
    error,
    refetch,
  }
}
