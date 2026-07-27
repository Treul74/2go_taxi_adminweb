import { MoreVertical } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import Skeleton from '../../../components/ui/Skeleton'
import StateMessage from '../../../components/ui/StateMessage'
import { timeAgo } from '../../../lib/format'
import type { ManagerRow, ManagerStatus } from '../../../types/managers'

interface ManagersTableProps {
  rows: ManagerRow[]
  isLoading: boolean
  error: string | null
  onSetStatus: (managerId: string, status: ManagerStatus) => void
}

const PALETTE = ['#26344F', '#FE5035', '#00A67D', '#7C5CFC', '#0EA5E9', '#D97706', '#64748B']

function colorForName(name: string) {
  let hash = 0
  for (let i = 0; i < name.length; i += 1) hash = name.charCodeAt(i) + ((hash << 5) - hash)
  return PALETTE[Math.abs(hash) % PALETTE.length]
}

function initials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || '?'
}

function StatusPill({ status }: { status: ManagerStatus }) {
  if (status === 'approved') {
    return (
      <span className="inline-flex items-center rounded-full bg-success/10 px-2.5 py-1 text-xs font-bold uppercase text-success">
        APPROVED
      </span>
    )
  }
  if (status === 'rejected') {
    return (
      <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-1 text-xs font-bold uppercase text-muted">
        REJECTED
      </span>
    )
  }
  return (
    <span className="inline-flex items-center rounded-full bg-warning/10 px-2.5 py-1 text-xs font-bold uppercase text-[#9A6B00]">
      PENDING
    </span>
  )
}

function RowActionMenu({
  row,
  onSetStatus,
}: {
  row: ManagerRow
  onSetStatus: (id: string, status: ManagerStatus) => void
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  function choose(status: ManagerStatus) {
    setOpen(false)
    onSetStatus(row.id, status)
  }

  return (
    <div ref={ref} className="relative inline-block text-left">
      <button
        type="button"
        aria-label={`Actions for ${row.fullName}`}
        onClick={() => setOpen((prev) => !prev)}
        className="flex h-8 w-8 items-center justify-center rounded-lg border-0 bg-transparent text-muted transition hover:bg-gray-100 hover:text-primary"
      >
        <MoreVertical className="h-4 w-4" />
      </button>

      {open && (
        <div className="absolute right-0 z-10 mt-1 w-40 rounded-lg border border-gray-100 bg-white py-1 shadow-lg">
          {row.status !== 'approved' && (
            <button
              type="button"
              onClick={() => choose('approved')}
              className="block w-full border-0 bg-transparent px-4 py-2 text-left text-sm font-semibold text-accent hover:bg-gray-50"
            >
              Approve
            </button>
          )}
          {row.status !== 'rejected' && (
            <button
              type="button"
              onClick={() => choose('rejected')}
              className="block w-full border-0 bg-transparent px-4 py-2 text-left text-sm text-danger hover:bg-gray-50"
            >
              Reject
            </button>
          )}
        </div>
      )}
    </div>
  )
}

export default function ManagersTable({ rows, isLoading, error, onSetStatus }: ManagersTableProps) {
  if (error) {
    return <StateMessage variant="error" title="Unable to load managers" description={error} />
  }

  if (isLoading) {
    return (
      <div className="flex flex-col gap-3 py-6 px-6">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    )
  }

  if (rows.length === 0) {
    return (
      <div className="p-6">
        <StateMessage variant="empty" title="No managers found" description="Try adjusting your search or filter criteria." />
      </div>
    )
  }

  return (
    <table className="w-full text-left text-sm">
      <thead>
        <tr className="border-b border-gray-100 bg-gray-50/60 text-xs font-bold tracking-wider text-muted uppercase">
          <th className="px-6 py-4">MANAGER</th>
          <th className="px-6 py-4">ROLE</th>
          <th className="px-6 py-4">REGION</th>
          <th className="px-6 py-4">STATUS</th>
          <th className="px-6 py-4">LAST LOGIN</th>
          <th className="px-6 py-4">ACTIONS</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-100">
        {rows.map((row) => (
          <tr key={row.id} className="transition hover:bg-gray-50/50">
            <td className="px-6 py-4">
              <div className="flex items-center gap-3">
                <span
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg font-bold text-white shadow-sm"
                  style={{ backgroundColor: colorForName(row.fullName) }}
                >
                  {initials(row.fullName)}
                </span>
                <div>
                  <p className="font-bold text-primary leading-tight">{row.fullName}</p>
                  <p className="text-xs text-muted mt-0.5">{row.email}</p>
                </div>
              </div>
            </td>
            <td className="px-6 py-4 font-medium text-primary">{row.role || 'Unassigned'}</td>
            <td className="px-6 py-4">
              {row.district ? (
                <>
                  <p className="font-medium text-primary leading-tight">{row.district},</p>
                  <p className="text-xs text-muted mt-0.5">{row.province}</p>
                </>
              ) : (
                <p className="font-medium text-primary">{row.province || 'Unassigned'}</p>
              )}
            </td>
            <td className="px-6 py-4">
              <StatusPill status={row.status} />
            </td>
            <td className="px-6 py-4 text-sm text-primary">
              {row.lastLoginAt ? timeAgo(row.lastLoginAt) : 'Never'}
            </td>
            <td className="px-6 py-4">
              <RowActionMenu row={row} onSetStatus={onSetStatus} />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
