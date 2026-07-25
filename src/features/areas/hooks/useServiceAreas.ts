import { useState } from 'react'
import { usePolledQuery } from '../../../hooks/usePolledQuery'
import {
  createServiceArea,
  fetchActiveTripsCount,
  fetchServiceAreaHierarchy,
  updateServiceAreaPolygon,
  updateServiceAreaStatus,
} from '../../../lib/serviceAreas'
import type { LatLng, ServiceAreaInput, ServiceAreaStatus } from '../../../types/serviceAreas'

export function useServiceAreas() {
  const hierarchy = usePolledQuery(fetchServiceAreaHierarchy, [], { intervalMs: 30000 })
  const activeTrips = usePolledQuery(fetchActiveTripsCount, [], { intervalMs: 15000 })

  const [selectedAreaId, setSelectedAreaId] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)

  const areas = hierarchy.data?.areas ?? []

  const selectedArea = areas.find((a) => a.id === selectedAreaId) ?? null
  const activeCount = areas.filter((a) => a.status === 'active').length

  async function save(input: ServiceAreaInput) {
    setIsSaving(true)
    setActionError(null)
    try {
      const created = await createServiceArea(input)
      await hierarchy.refetch()
      setSelectedAreaId(created.id)
      return created
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Unable to create service area.')
      throw err
    } finally {
      setIsSaving(false)
    }
  }

  async function setStatus(id: string, status: ServiceAreaStatus) {
    setIsSaving(true)
    setActionError(null)
    try {
      await updateServiceAreaStatus(id, status)
      await hierarchy.refetch()
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Unable to update status.')
    } finally {
      setIsSaving(false)
    }
  }

  async function savePolygon(id: string, points: LatLng[]) {
    setIsSaving(true)
    setActionError(null)
    try {
      await updateServiceAreaPolygon(id, points)
      await hierarchy.refetch()
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Unable to save the drawn polygon.')
      throw err
    } finally {
      setIsSaving(false)
    }
  }

  return {
    areas,
    isLoading: hierarchy.isLoading,
    error: hierarchy.error,
    activeCount,
    totalCount: areas.length,
    activeTrips: activeTrips.data ?? 0,
    selectedAreaId,
    selectedArea,
    setSelectedAreaId,
    isSaving,
    actionError,
    save,
    setStatus,
    savePolygon,
  }
}
