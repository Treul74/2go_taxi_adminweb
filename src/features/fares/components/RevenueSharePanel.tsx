import { Landmark } from 'lucide-react'

interface RevenueSharePanelProps {
  platformCommissionPct: string
  driverCommissionPct: number
  onPlatformCommissionChange: (value: string) => void
}

export default function RevenueSharePanel({
  platformCommissionPct,
  driverCommissionPct,
  onPlatformCommissionChange,
}: RevenueSharePanelProps) {
  return (
    <div className="rounded-card bg-primary p-6 text-white">
      <div className="mb-5 flex items-center gap-2">
        <Landmark className="h-5 w-5" />
        <h2 className="text-lg font-bold">Revenue Share</h2>
      </div>

      <div className="flex flex-col gap-5">
        <div>
          <label htmlFor="rf-platform-pct" className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-300">
            Platform Commission %
          </label>
          <div className="flex items-center justify-between rounded-lg bg-white/10 px-3 py-2.5">
            <input
              id="rf-platform-pct"
              type="number"
              step="0.1"
              min={0}
              max={100}
              value={platformCommissionPct}
              onChange={(e) => onPlatformCommissionChange(e.target.value)}
              className="w-full border-0 bg-transparent text-lg font-bold text-white focus:outline-none"
            />
            <span className="text-sm text-slate-300">%</span>
          </div>
        </div>

        <div>
          <label htmlFor="rf-driver-pct" className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-300">
            Driver Commission %
          </label>
          <div className="flex items-center justify-between rounded-lg bg-white/5 px-3 py-2.5">
            <input
              id="rf-driver-pct"
              type="text"
              readOnly
              value={driverCommissionPct}
              className="w-full border-0 bg-transparent text-lg font-bold text-slate-400 focus:outline-none"
            />
            <span className="text-sm text-slate-400">%</span>
          </div>
          <p className="mt-1.5 text-xs italic text-slate-400">Auto-calculated based on platform share.</p>
        </div>
      </div>
    </div>
  )
}
