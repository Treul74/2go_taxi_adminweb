import { Calendar, ChevronDown } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { formatDate } from '../../lib/format'

interface DateRangeFilterProps {
  from: Date | null
  to: Date | null
  onChange: (from: Date | null, to: Date | null) => void
  placeholder?: string
}

function toInputValue(date: Date | null) {
  if (!date) return ''
  return date.toISOString().slice(0, 10)
}

export default function DateRangeFilter({ from, to, onChange, placeholder = 'All time' }: DateRangeFilterProps) {
  const [open, setOpen] = useState(false)
  const [draftFrom, setDraftFrom] = useState(toInputValue(from))
  const [draftTo, setDraftTo] = useState(toInputValue(to))
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function handleApply() {
    onChange(draftFrom ? new Date(draftFrom) : null, draftTo ? new Date(draftTo) : null)
    setOpen(false)
  }

  function handleClear() {
    setDraftFrom('')
    setDraftTo('')
    onChange(null, null)
    setOpen(false)
  }

  const label = from && to ? `${formatDate(from)} - ${formatDate(to)}` : placeholder

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-primary"
      >
        <Calendar className="h-4 w-4 text-muted" />
        {label}
        <ChevronDown className="h-4 w-4 text-muted" />
      </button>

      {open && (
        <div className="absolute right-0 z-20 mt-2 w-72 rounded-card border border-gray-100 bg-card p-4 shadow-xl">
          <div className="flex flex-col gap-3">
            <label className="text-xs font-semibold text-muted">
              From
              <input
                type="date"
                value={draftFrom}
                onChange={(e) => setDraftFrom(e.target.value)}
                className="mt-1 block w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-primary focus:border-accent focus:outline-none"
              />
            </label>
            <label className="text-xs font-semibold text-muted">
              To
              <input
                type="date"
                value={draftTo}
                onChange={(e) => setDraftTo(e.target.value)}
                className="mt-1 block w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-primary focus:border-accent focus:outline-none"
              />
            </label>
          </div>

          <div className="mt-4 flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={handleClear}
              className="rounded-button border-0 bg-gray-100 px-3 py-2 text-xs font-semibold text-primary hover:bg-gray-200"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={handleApply}
              disabled={!draftFrom || !draftTo}
              className="rounded-button border-0 bg-primary px-4 py-2 text-xs font-bold text-white disabled:opacity-50"
            >
              Apply
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
