import { useMemo, useState } from 'react'
import { fetchFareConfigs, updateFareConfig } from '../../../lib/fareConfig'
import { fetchVehicleClasses } from '../../../lib/vehicleClasses'
import { usePolledQuery } from '../../../hooks/usePolledQuery'
import type { FareConfigInput, FareConfigRow } from '../../../types/fareConfig'

export function useFareConfig() {
  const classes = usePolledQuery(fetchVehicleClasses, [])
  const configs = usePolledQuery(fetchFareConfigs, [], { intervalMs: 30000 })
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  const activeClassId = selectedClassId ?? classes.data?.[0]?.id ?? null

  const configByClassId = useMemo(() => {
    const map = new Map<string, FareConfigRow>()
    for (const config of configs.data ?? []) map.set(config.vehicleClassId, config)
    return map
  }, [configs.data])

  const selectedConfig = activeClassId ? (configByClassId.get(activeClassId) ?? null) : null

  async function save(input: FareConfigInput) {
    if (!activeClassId) return
    setIsSaving(true)
    setSaveError(null)
    try {
      await updateFareConfig(activeClassId, input)
      await configs.refetch()
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Unable to save fare configuration.')
      throw err
    } finally {
      setIsSaving(false)
    }
  }

  return {
    classes: classes.data ?? [],
    classesLoading: classes.isLoading,
    classesError: classes.error,
    configsLoading: configs.isLoading,
    configsError: configs.error,
    activeClassId,
    setActiveClassId: setSelectedClassId,
    selectedConfig,
    isSaving,
    saveError,
    save,
  }
}
