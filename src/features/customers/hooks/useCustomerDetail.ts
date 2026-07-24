import { usePolledQuery } from '../../../hooks/usePolledQuery'
import { fetchCustomerDetail, fetchCustomerRideHistory, updateCustomerStatus } from '../../../lib/customers'
import type { CustomerAccountStatus } from '../../../types/customers'

export function useCustomerDetail(customerId: string | null, refreshToken = 0) {
  const { data, isLoading, error, refetch } = usePolledQuery(
    () =>
      customerId
        ? Promise.all([fetchCustomerDetail(customerId), fetchCustomerRideHistory(customerId)])
        : Promise.resolve(null),
    [customerId, refreshToken],
  )

  async function setStatus(status: CustomerAccountStatus) {
    if (!customerId) return
    await updateCustomerStatus(customerId, status)
    await refetch()
  }

  return {
    customer: data?.[0] ?? null,
    rideHistory: data?.[1] ?? [],
    isLoading,
    error,
    refetch,
    setStatus,
  }
}
