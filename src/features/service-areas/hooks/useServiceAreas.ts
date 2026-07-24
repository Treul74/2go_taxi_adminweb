import { useState } from 'react'
import { createServiceArea, fetchServiceAreas, setServiceAreaStatus, updateServiceArea } from '../../../lib/serviceAreas'
import { usePolledQuery } from '../../../hooks/usePolledQuery'
import type { ServiceAreaInput, ServiceAreaStatus } from '../../../types/serviceAreas'

export function useServiceAreas() {
  const { data, isLoading, error, refetch } = usePolledQuery(fetchServiceAreas, [], {
    intervalMs: 20000,
  })

  const [savingId, setSavingId] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  async function save(input: ServiceAreaInput, id?: string) {
    setSavingId(id ?? 'new')
    setActionError(null)
    try {
      if (id) {
        await updateServiceArea(id, input)
      } else {
        await createServiceArea(input)
      }
      await refetch()
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Unable to save service area.')
      throw err
    } finally {
      setSavingId(null)
    }
  }

  async function toggleStatus(id: string, nextStatus: ServiceAreaStatus) {
    setSavingId(id)
    setActionError(null)
    try {
      await setServiceAreaStatus(id, nextStatus)
      await refetch()
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Unable to update status.')
    } finally {
      setSavingId(null)
    }
  }

  return { areas: data ?? [], isLoading, error, actionError, savingId, save, toggleStatus, refetch }
}
