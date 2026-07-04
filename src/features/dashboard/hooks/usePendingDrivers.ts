import { useState } from 'react'
import { approveDriver, fetchPendingDrivers, rejectDriver } from '../../../lib/dashboard'
import { usePolledQuery } from '../../../hooks/usePolledQuery'

export function usePendingDrivers(limit = 5) {
  const { data, isLoading, error, refetch } = usePolledQuery(() => fetchPendingDrivers(limit), [limit], {
    intervalMs: 20000,
  })

  const [actioningId, setActioningId] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  async function approve(driverId: string) {
    setActioningId(driverId)
    setActionError(null)
    try {
      await approveDriver(driverId)
      await refetch()
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Unable to approve driver.')
    } finally {
      setActioningId(null)
    }
  }

  async function reject(driverId: string) {
    setActioningId(driverId)
    setActionError(null)
    try {
      await rejectDriver(driverId)
      await refetch()
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Unable to reject driver.')
    } finally {
      setActioningId(null)
    }
  }

  return { drivers: data ?? [], isLoading, error, actionError, actioningId, approve, reject }
}
