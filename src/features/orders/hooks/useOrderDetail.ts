import { usePolledQuery } from '../../../hooks/usePolledQuery'
import { fetchOrderDetail, updateOrderStatus } from '../../../lib/orders'

export function useOrderDetail(orderId: string | null) {
  const { data, isLoading, error, refetch } = usePolledQuery(
    () => (orderId ? fetchOrderDetail(orderId) : Promise.resolve(null)),
    [orderId],
  )

  async function cancelOrder() {
    if (!orderId) return
    await updateOrderStatus(orderId, 'cancelled')
    await refetch()
  }

  return { order: data, isLoading, error, refetch, cancelOrder }
}
