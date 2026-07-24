import { Download, PlayCircle, Save } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import AdminLayout from '../../components/layout/AdminLayout'
import Skeleton from '../../components/ui/Skeleton'
import StateMessage from '../../components/ui/StateMessage'
import { formatDateTime, timeAgo } from '../../lib/format'
import RevenueSharePanel from './components/RevenueSharePanel'
import SampleEstimateCard from './components/SampleEstimateCard'
import StandardFareRatesCard, { type FareRateFields } from './components/StandardFareRatesCard'
import SurchargeFactorsCard from './components/SurchargeFactorsCard'
import VehicleClassTabs from './components/VehicleClassTabs'
import { useFareConfig } from './hooks/useFareConfig'
import type { FareConfigInput } from '../../types/fareConfig'

function emptyFields(): FareRateFields {
  return { baseFare: '0', minFare: '0', perKm: '0', perMinute: '0', waitingFee: '0', cancellationFee: '0' }
}

export default function FareConfiguration() {
  const {
    classes,
    classesLoading,
    classesError,
    configsLoading,
    configsError,
    activeClassId,
    setActiveClassId,
    selectedConfig,
    isSaving,
    saveError,
    save,
  } = useFareConfig()

  const [fields, setFields] = useState<FareRateFields>(emptyFields())
  const [platformPct, setPlatformPct] = useState('0')
  const [nightMultiplier, setNightMultiplier] = useState('1')
  const [peakMultiplier, setPeakMultiplier] = useState('1')
  const estimateRef = useRef<HTMLDivElement>(null)

  function loadFromConfig() {
    if (!selectedConfig) {
      setFields(emptyFields())
      setPlatformPct('0')
      setNightMultiplier('1')
      setPeakMultiplier('1')
      return
    }
    setFields({
      baseFare: String(selectedConfig.baseFare),
      minFare: String(selectedConfig.minFare),
      perKm: String(selectedConfig.perKm),
      perMinute: String(selectedConfig.perMinute),
      waitingFee: String(selectedConfig.perMinuteWaiting),
      cancellationFee: String(selectedConfig.cancellationFee),
    })
    setPlatformPct(String(selectedConfig.platformCommissionPct))
    setNightMultiplier(String(selectedConfig.nightRateMultiplier))
    setPeakMultiplier(String(selectedConfig.peakMultiplier))
  }

  // Re-sync the form whenever the loaded row for the active class changes
  // (tab switch, or a refetch bringing back saved values).
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(loadFromConfig, [selectedConfig])

  function handleFieldChange(key: keyof FareRateFields, value: string) {
    setFields((prev) => ({ ...prev, [key]: value }))
  }

  const platformPctNumber = Math.min(100, Math.max(0, Number(platformPct) || 0))
  const driverPctNumber = Math.round((100 - platformPctNumber) * 100) / 100

  async function handleSave() {
    const input: FareConfigInput = {
      baseFare: Number(fields.baseFare) || 0,
      minFare: Number(fields.minFare) || 0,
      perKm: Number(fields.perKm) || 0,
      perMinute: Number(fields.perMinute) || 0,
      perMinuteWaiting: Number(fields.waitingFee) || 0,
      cancellationFee: Number(fields.cancellationFee) || 0,
      nightRateMultiplier: Number(nightMultiplier) || 1,
      peakMultiplier: Number(peakMultiplier) || 1,
      platformCommissionPct: platformPctNumber,
      driverCommissionPct: driverPctNumber,
    }
    try {
      await save(input)
    } catch {
      // surfaced via saveError below
    }
  }

  const isLoading = classesLoading || configsLoading
  const loadError = classesError || configsError

  function handleExportJson() {
    if (!selectedConfig) return
    const activeClass = classes.find((c) => c.id === activeClassId)
    const payload = {
      vehicleClass: activeClass?.name ?? selectedConfig.vehicleType,
      baseFare: Number(fields.baseFare) || 0,
      minFare: Number(fields.minFare) || 0,
      perKm: Number(fields.perKm) || 0,
      perMinute: Number(fields.perMinute) || 0,
      waitingFeePerMinute: Number(fields.waitingFee) || 0,
      cancellationFee: Number(fields.cancellationFee) || 0,
      nightRateMultiplier: Number(nightMultiplier) || 1,
      peakMultiplier: Number(peakMultiplier) || 1,
      platformCommissionPct: platformPctNumber,
      driverCommissionPct: driverPctNumber,
    }
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `fare-config-${payload.vehicleClass.toLowerCase()}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <AdminLayout>
      <div className="flex flex-col gap-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-primary">Fare Configuration</h1>
            <p className="text-sm text-muted">Adjust pricing strategies and commission structures per vehicle class.</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleExportJson}
              disabled={!selectedConfig}
              className="flex items-center gap-2 rounded-button border border-gray-200 bg-white px-4 py-2.5 text-sm font-bold text-primary transition hover:bg-gray-50 disabled:opacity-50"
            >
              <Download className="h-4 w-4" />
              Export JSON
            </button>
            <button
              type="button"
              onClick={() => estimateRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })}
              className="flex items-center gap-2 rounded-button border-0 bg-primary px-4 py-2.5 text-sm font-bold text-white transition hover:brightness-110"
            >
              <PlayCircle className="h-4 w-4" />
              Preview Simulation
            </button>
          </div>
        </div>

        {loadError && <StateMessage variant="error" title="Unable to load fare configuration" description={loadError} />}

        {!loadError && (
          <>
            <VehicleClassTabs
              classes={classes}
              isLoading={classesLoading}
              activeClassId={activeClassId}
              onSelect={setActiveClassId}
            />

            {isLoading ? (
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <Skeleton className="h-96 lg:col-span-2" />
                <Skeleton className="h-96" />
              </div>
            ) : selectedConfig ? (
              <>
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                  <div className="lg:col-span-2">
                    <StandardFareRatesCard values={fields} onChange={handleFieldChange} />
                  </div>
                  <div className="flex flex-col gap-6">
                    <RevenueSharePanel
                      platformCommissionPct={platformPct}
                      driverCommissionPct={driverPctNumber}
                      onPlatformCommissionChange={setPlatformPct}
                    />
                    <SurchargeFactorsCard
                      nightMultiplier={nightMultiplier}
                      peakMultiplier={peakMultiplier}
                      onNightMultiplierChange={setNightMultiplier}
                      onPeakMultiplierChange={setPeakMultiplier}
                    />
                  </div>
                </div>

                <div ref={estimateRef}>
                  <SampleEstimateCard
                    baseFare={Number(fields.baseFare) || 0}
                    perKm={Number(fields.perKm) || 0}
                    perMinute={Number(fields.perMinute) || 0}
                    minFare={Number(fields.minFare) || 0}
                  />
                </div>

                {saveError && <p className="text-sm font-semibold text-danger">{saveError}</p>}

                <div className="flex flex-wrap items-center justify-between gap-4 rounded-card bg-card p-5 shadow-sm">
                  <p className="text-xs text-muted">
                    Last updated {formatDateTime(selectedConfig.updatedAt)} ({timeAgo(selectedConfig.updatedAt)})
                  </p>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={loadFromConfig}
                      className="rounded-button border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-primary transition hover:bg-gray-50"
                    >
                      Discard Changes
                    </button>
                    <button
                      type="button"
                      onClick={() => void handleSave()}
                      disabled={isSaving}
                      className="flex items-center gap-2 rounded-button border-0 bg-accent px-5 py-2.5 text-sm font-bold text-white transition hover:brightness-110 disabled:opacity-60"
                    >
                      <Save className="h-4 w-4" />
                      {isSaving ? 'Saving…' : 'Save Configuration'}
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <StateMessage
                variant="empty"
                title="No fare configuration for this class yet"
                description="This vehicle class has no pricing row in fare_config."
              />
            )}
          </>
        )}
      </div>
    </AdminLayout>
  )
}
