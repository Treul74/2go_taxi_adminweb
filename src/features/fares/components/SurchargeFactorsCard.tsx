import { Moon, Zap } from 'lucide-react'
import Card from '../../../components/ui/Card'

interface SurchargeFactorsCardProps {
  nightMultiplier: string
  peakMultiplier: string
  onNightMultiplierChange: (value: string) => void
  onPeakMultiplierChange: (value: string) => void
}

export default function SurchargeFactorsCard({
  nightMultiplier,
  peakMultiplier,
  onNightMultiplierChange,
  onPeakMultiplierChange,
}: SurchargeFactorsCardProps) {
  return (
    <Card className="p-6">
      <p className="mb-4 text-xs font-bold uppercase tracking-wide text-muted">Surcharge Factors</p>

      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between rounded-lg bg-gray-50 px-3.5 py-3">
          <div className="flex items-center gap-2.5">
            <Moon className="h-4 w-4 text-indigo-500" />
            <span className="text-sm font-semibold text-primary">Night Multiplier</span>
          </div>
          <div className="flex items-center gap-1">
            <input
              aria-label="Night multiplier"
              type="number"
              step="0.1"
              min={0}
              value={nightMultiplier}
              onChange={(e) => onNightMultiplierChange(e.target.value)}
              className="w-14 rounded-md border border-gray-200 bg-white px-2 py-1 text-right text-sm font-bold text-primary focus:border-accent focus:outline-none"
            />
            <span className="text-sm font-bold text-primary">x</span>
          </div>
        </div>

        <div className="flex items-center justify-between rounded-lg bg-gray-50 px-3.5 py-3">
          <div className="flex items-center gap-2.5">
            <Zap className="h-4 w-4 text-amber-500" />
            <span className="text-sm font-semibold text-primary">Peak Hour</span>
          </div>
          <div className="flex items-center gap-1">
            <input
              aria-label="Peak hour multiplier"
              type="number"
              step="0.1"
              min={0}
              value={peakMultiplier}
              onChange={(e) => onPeakMultiplierChange(e.target.value)}
              className="w-14 rounded-md border border-gray-200 bg-white px-2 py-1 text-right text-sm font-bold text-primary focus:border-accent focus:outline-none"
            />
            <span className="text-sm font-bold text-primary">x</span>
          </div>
        </div>
      </div>
    </Card>
  )
}
