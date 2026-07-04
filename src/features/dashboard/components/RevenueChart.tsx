import { useState } from 'react'
import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis } from 'recharts'
import Card from '../../../components/ui/Card'
import Skeleton from '../../../components/ui/Skeleton'
import StateMessage from '../../../components/ui/StateMessage'
import { formatCurrency } from '../../../lib/format'
import type { RevenuePoint, RevenueRangePreset } from '../../../types/dashboard'

interface RevenueChartProps {
  points: RevenuePoint[]
  isLoading: boolean
  error: string | null
  preset: RevenueRangePreset
  setRangePreset: (preset: RevenueRangePreset) => void
  applyCustomRange: (from: Date, to: Date) => void
}

const PRESETS: { value: RevenueRangePreset; label: string }[] = [
  { value: 'today', label: 'Today' },
  { value: 'week', label: 'This Week' },
  { value: 'month', label: 'This Month' },
  { value: 'custom', label: 'Custom' },
]

function barColor(revenue: number, sortedDesc: number[]): string {
  if (revenue <= 0) return '#E5E7EB'
  if (revenue === sortedDesc[0]) return '#FE5035'
  if (revenue === sortedDesc[1]) return '#FCA99A'
  return '#D1D5DB'
}

export default function RevenueChart({
  points,
  isLoading,
  error,
  preset,
  setRangePreset,
  applyCustomRange,
}: RevenueChartProps) {
  const [customFrom, setCustomFrom] = useState('')
  const [customTo, setCustomTo] = useState('')

  const sortedDesc = [...points.map((p) => p.revenue)].sort((a, b) => b - a)

  function handleApplyCustom() {
    if (!customFrom || !customTo) return
    applyCustomRange(new Date(customFrom), new Date(customTo))
  }

  return (
    <Card className="p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-primary">Revenue Overview</h2>
          <p className="text-sm text-muted">Platform earnings performance</p>
        </div>

        <div className="flex flex-wrap items-center gap-1 rounded-lg bg-gray-100 p-1">
          {PRESETS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setRangePreset(option.value)}
              className={`rounded-md border-0 px-3 py-1.5 text-xs font-semibold transition ${
                preset === option.value ? 'bg-white text-primary shadow-sm' : 'bg-transparent text-muted'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {preset === 'custom' && (
        <div className="mt-4 flex flex-wrap items-end gap-3">
          <label className="text-xs font-semibold text-muted">
            From
            <input
              type="date"
              value={customFrom}
              onChange={(e) => setCustomFrom(e.target.value)}
              className="mt-1 block rounded-lg border border-gray-200 px-3 py-2 text-sm text-primary focus:border-accent focus:outline-none"
            />
          </label>
          <label className="text-xs font-semibold text-muted">
            To
            <input
              type="date"
              value={customTo}
              onChange={(e) => setCustomTo(e.target.value)}
              className="mt-1 block rounded-lg border border-gray-200 px-3 py-2 text-sm text-primary focus:border-accent focus:outline-none"
            />
          </label>
          <button
            type="button"
            onClick={handleApplyCustom}
            disabled={!customFrom || !customTo}
            className="rounded-button border-0 bg-primary px-4 py-2 text-xs font-bold text-white disabled:opacity-50"
          >
            Apply
          </button>
        </div>
      )}

      <div className="mt-6 h-64">
        {error ? (
          <StateMessage variant="error" title="Unable to load revenue" description={error} />
        ) : isLoading ? (
          <Skeleton className="h-full w-full" />
        ) : points.every((p) => p.revenue === 0) ? (
          <StateMessage variant="empty" title="No revenue in this range" description="Completed orders will appear here." />
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={points} barCategoryGap="30%">
              <XAxis
                dataKey="label"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#7B8387', fontSize: 12 }}
              />
              <Tooltip
                cursor={{ fill: 'transparent' }}
                formatter={(value) => formatCurrency(Number(value))}
                contentStyle={{ borderRadius: 8, border: '1px solid #E5E7EB' }}
              />
              <Bar dataKey="revenue" radius={[6, 6, 0, 0]}>
                {points.map((point) => (
                  <Cell key={point.key} fill={barColor(point.revenue, sortedDesc)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </Card>
  )
}
