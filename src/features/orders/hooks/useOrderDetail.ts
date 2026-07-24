import { usePolledQuery } from '../../../hooks/usePolledQuery'
import { fetchOrderDetail } from '../../../lib/orders'

export function useOrderDetail(orderId: string | null) {
  const { data, isLoading, error, refetch } = usePolledQuery(
    () => (orderId ? fetchOrderDetail(orderId) : Promise.resolve(null)),
    [orderId],
  )

  return { order: data, isLoading, error, refetch }
}
