import { fetchVehicleClassStats } from '../../../lib/vehicleClasses'
import { usePolledQuery } from '../../../hooks/usePolledQuery'

export function useVehicleClassStats() {
  const { data, isLoading, error, refetch } = usePolledQuery(fetchVehicleClassStats, [], {
    intervalMs: 20000,
  })

  return { stats: data, isLoading, error, refetch }
}
