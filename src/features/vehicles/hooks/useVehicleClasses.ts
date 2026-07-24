import { useState } from 'react'
import {
  createVehicleClass,
  fetchVehicleClasses,
  setVehicleClassStatus,
  updateVehicleClass,
} from '../../../lib/vehicleClasses'
import { usePolledQuery } from '../../../hooks/usePolledQuery'
import type { VehicleClassInput } from '../../../types/vehicleClasses'

export function useVehicleClasses() {
  const { data, isLoading, error, refetch } = usePolledQuery(fetchVehicleClasses, [], {
    intervalMs: 20000,
  })

  const [savingId, setSavingId] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  async function save(input: VehicleClassInput, id?: string) {
    setSavingId(id ?? 'new')
    setActionError(null)
    try {
      if (id) {
        await updateVehicleClass(id, input)
      } else {
        await createVehicleClass(input)
      }
      await refetch()
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Unable to save vehicle class.')
      throw err
    } finally {
      setSavingId(null)
    }
  }

  async function toggleStatus(id: string, nextStatus: 'active' | 'inactive') {
    setSavingId(id)
    setActionError(null)
    try {
      await setVehicleClassStatus(id, nextStatus)
      await refetch()
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Unable to update status.')
    } finally {
      setSavingId(null)
    }
  }

  return { classes: data ?? [], isLoading, error, actionError, savingId, save, toggleStatus, refetch }
}
