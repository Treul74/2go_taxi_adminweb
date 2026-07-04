import { useState } from 'react'
import { buildRevenueRange, fetchRevenueSeries } from '../../../lib/dashboard'
import type { RevenueRangePreset } from '../../../types/dashboard'
import { usePolledQuery } from '../../../hooks/usePolledQuery'

export function useRevenueSeries() {
  const [preset, setPreset] = useState<RevenueRangePreset>('week')
  const [customRange, setCustomRange] = useState<{ from: Date; to: Date } | null>(null)

  const range = preset === 'custom' && !customRange ? null : buildRevenueRange(preset, customRange ?? undefined)

  const { data, isLoading, error, refetch } = usePolledQuery(
    async () => (range ? fetchRevenueSeries(range) : []),
    [preset, customRange?.from.getTime(), customRange?.to.getTime()],
    { intervalMs: 30000 },
  )

  function setRangePreset(nextPreset: RevenueRangePreset) {
    setPreset(nextPreset)
    if (nextPreset !== 'custom') setCustomRange(null)
  }

  function applyCustomRange(from: Date, to: Date) {
    setPreset('custom')
    setCustomRange({ from, to })
  }

  return {
    points: data ?? [],
    isLoading,
    error,
    refetch,
    preset,
    customRange,
    setRangePreset,
    applyCustomRange,
  }
}
