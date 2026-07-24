import { fetchCustomerStats } from '../../../lib/customers'
import { usePolledQuery } from '../../../hooks/usePolledQuery'

export function useCustomerStats() {
  const { data, isLoading, error, refetch } = usePolledQuery(fetchCustomerStats, [], {
    intervalMs: 20000,
  })

  return { stats: data, isLoading, error, refetch }
}
