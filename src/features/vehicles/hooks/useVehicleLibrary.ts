import { useState } from 'react'
import { usePolledQuery } from '../../../hooks/usePolledQuery'
import { createLibraryEntry, deleteLibraryEntry, fetchLibraryByCategory } from '../../../lib/library'
import type { LibraryEntry } from '../../../types/library'

export function useVehicleLibrary() {
  const makesQuery = usePolledQuery(() => fetchLibraryByCategory('vehicle_make'), [])
  const modelsQuery = usePolledQuery(() => fetchLibraryByCategory('vehicle_model'), [])

  const [selectedMakeId, setSelectedMakeId] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)

  const makes = makesQuery.data ?? []
  const selectedMake = makes.find((m) => m.id === selectedMakeId) ?? null
  const modelsForSelectedMake = selectedMake
    ? (modelsQuery.data ?? []).filter((m) => m.parentValue === selectedMake.normalizedValue)
    : []

  async function refetchAll() {
    await Promise.all([makesQuery.refetch(), modelsQuery.refetch()])
  }

  async function addMake(value: string) {
    setIsSaving(true)
    setActionError(null)
    try {
      const created = await createLibraryEntry({ category: 'vehicle_make', value })
      await refetchAll()
      setSelectedMakeId(created.id)
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Unable to add make.')
      throw err
    } finally {
      setIsSaving(false)
    }
  }

  async function addModel(value: string) {
    if (!selectedMake) return
    setIsSaving(true)
    setActionError(null)
    try {
      await createLibraryEntry({ category: 'vehicle_model', value, parentValue: selectedMake.normalizedValue })
      await refetchAll()
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Unable to add model.')
      throw err
    } finally {
      setIsSaving(false)
    }
  }

  async function removeEntry(entry: LibraryEntry) {
    setIsSaving(true)
    setActionError(null)
    try {
      await deleteLibraryEntry(entry)
      if (entry.id === selectedMakeId) setSelectedMakeId(null)
      await refetchAll()
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Unable to delete entry.')
    } finally {
      setIsSaving(false)
    }
  }

  return {
    makes,
    modelsForSelectedMake,
    selectedMake,
    selectedMakeId,
    setSelectedMakeId,
    isLoading: makesQuery.isLoading || modelsQuery.isLoading,
    error: makesQuery.error ?? modelsQuery.error,
    isSaving,
    actionError,
    addMake,
    addModel,
    removeEntry,
  }
}
