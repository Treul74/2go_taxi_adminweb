import { CircleDollarSign } from 'lucide-react'
import Card from '../../../components/ui/Card'
import FareField from './FareField'
import Switch from '../../../components/ui/Switch'

export interface FareRateFields {
  baseFare: string
  minFare: string
  perKm: string
  perMinute: string
  waitingFee: string
  cancellationFee: string
}

interface StandardFareRatesCardProps {
  values: FareRateFields
  onChange: (key: keyof FareRateFields, value: string) => void
  isActive: boolean
  onActiveChange: (checked: boolean) => void
}

export default function StandardFareRatesCard({
  values,
  onChange,
  isActive,
  onActiveChange,
}: StandardFareRatesCardProps) {
  return (
    <Card className="p-6">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <CircleDollarSign className="h-5 w-5 text-accent" />
          <h2 className="text-lg font-bold text-primary">Standard Fare Rates</h2>
        </div>
        <div className="flex items-center gap-2.5">
          <span className="text-sm font-semibold text-slate-500">Active Status</span>
          <Switch checked={isActive} onChange={onActiveChange} label="Active Status Toggle" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">
        <FareField
          id="ff-base-fare"
          label="Base Fare (K)"
          value={values.baseFare}
          onChange={(v) => onChange('baseFare', v)}
          helperText="The fixed starting price for every trip."
        />
        <FareField
          id="ff-min-fare"
          label="Minimum Fare (K)"
          value={values.minFare}
          onChange={(v) => onChange('minFare', v)}
          helperText="The lowest amount a rider will pay."
        />
        <FareField
          id="ff-per-km"
          label="Per KM Rate (K)"
          value={values.perKm}
          onChange={(v) => onChange('perKm', v)}
          helperText="Added charge for each kilometer traveled."
        />
        <FareField
          id="ff-per-minute"
          label="Per Minute Rate (K)"
          value={values.perMinute}
          onChange={(v) => onChange('perMinute', v)}
          helperText="Duration-based charge while in motion."
        />

        <div className="col-span-full border-t border-gray-100 pt-5" />

        <FareField
          id="ff-waiting-fee"
          label="Waiting Fee (K/min)"
          value={values.waitingFee}
          onChange={(v) => onChange('waitingFee', v)}
          helperText="Charged per minute while the driver waits."
        />
        <FareField
          id="ff-cancellation-fee"
          label="Cancellation Fee (K)"
          value={values.cancellationFee}
          onChange={(v) => onChange('cancellationFee', v)}
          helperText="Charged when a rider cancels after the grace period."
        />
      </div>
    </Card>
  )
}
