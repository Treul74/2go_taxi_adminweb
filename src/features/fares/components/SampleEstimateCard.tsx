import Card from '../../../components/ui/Card'
import { formatCurrency } from '../../../lib/format'

const SAMPLE_DISTANCE_KM = 5.2
const SAMPLE_DURATION_MIN = 12

interface SampleEstimateCardProps {
  baseFare: number
  perKm: number
  perMinute: number
  minFare: number
}

export default function SampleEstimateCard({ baseFare, perKm, perMinute, minFare }: SampleEstimateCardProps) {
  const distanceFare = SAMPLE_DISTANCE_KM * perKm
  const timeFare = SAMPLE_DURATION_MIN * perMinute
  const subtotal = baseFare + distanceFare + timeFare
  const total = Math.max(subtotal, minFare)

  return (
    <Card className="grid grid-cols-1 overflow-hidden lg:grid-cols-2">
      <div className="p-6">
        <h2 className="mb-4 text-lg font-bold text-primary">Sample Estimate</h2>

        <div className="flex flex-col gap-3 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted">{SAMPLE_DISTANCE_KM} KM Trip</span>
            <span className="font-semibold text-primary">{formatCurrency(distanceFare)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted">{SAMPLE_DURATION_MIN} Min Duration</span>
            <span className="font-semibold text-primary">{formatCurrency(timeFare)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted">Base Fare</span>
            <span className="font-semibold text-primary">{formatCurrency(baseFare)}</span>
          </div>

          <div className="mt-2 flex items-center justify-between border-t border-gray-100 pt-3">
            <span className="font-bold text-primary">Total Rider Pays</span>
            <span className="text-xl font-bold text-accent">{formatCurrency(total)}</span>
          </div>
          {total > subtotal && <p className="text-xs text-muted">Minimum fare applied.</p>}
        </div>
      </div>

      <div className="relative flex min-h-[220px] items-center justify-center overflow-hidden bg-slate-100">
        <svg viewBox="0 0 200 140" className="h-full w-full text-slate-300" fill="none">
          {Array.from({ length: 9 }).map((_, i) => (
            <line key={`v${i}`} x1={i * 25} y1={0} x2={i * 25} y2={140} stroke="currentColor" strokeWidth={1} />
          ))}
          {Array.from({ length: 6 }).map((_, i) => (
            <line key={`h${i}`} x1={0} y1={i * 25} x2={200} y2={i * 25} stroke="currentColor" strokeWidth={1} />
          ))}
          <path d="M30 110 L100 70 L170 30" stroke="#f97316" strokeWidth={2.5} strokeLinecap="round" />
        </svg>
        <span className="absolute left-6 bottom-6 flex h-6 w-6 items-center justify-center rounded-full bg-white text-xs font-bold text-primary shadow">
          A
        </span>
        <span className="absolute right-6 top-6 flex h-6 w-6 items-center justify-center rounded-full bg-white text-xs font-bold text-primary shadow">
          B
        </span>
      </div>
    </Card>
  )
}
