import { fetchDashboardStats } from '../../../lib/dashboard'
import { usePolledQuery } from '../../../hooks/usePolledQuery'

export function useDashboardStats() {
  const { data, isLoading, error, refetch } = usePolledQuery(fetchDashboardStats, [], {
    intervalMs: 20000,
  })

  return { stats: data, isLoading, error, refetch }
}
