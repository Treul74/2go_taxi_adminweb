import { MoreVertical } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import Avatar from '../../../components/ui/Avatar'
import Skeleton from '../../../components/ui/Skeleton'
import StateMessage from '../../../components/ui/StateMessage'
import type { CustomerAccountStatus, CustomerListRow } from '../../../types/customers'
import { CustomerStatusBadge } from './CustomerStatusBadge'

interface CustomersTableProps {
  rows: CustomerListRow[]
  isLoading: boolean
  error: string | null
  selectedId: string | null
  onSelect: (customerId: string) => void
  onSetStatus: (customerId: string, status: CustomerAccountStatus) => void
}

function customerName(row: CustomerListRow) {
  const name = [row.firstName, row.lastName].filter(Boolean).join(' ').trim()
  return name || 'Unknown customer'
}

function shortId(id: string) {
  return `2G-${id.slice(0, 6).toUpperCase()}`
}

function RowActionMenu({ row, onSelect, onSetStatus }: Pick<CustomersTableProps, 'onSelect' | 'onSetStatus'> & { row: CustomerListRow }) {
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

  return (
    <div ref={ref} className="relative inline-block text-left">
      <button
        type="button"
        aria-label={`Actions for ${customerName(row)}`}
        onClick={(e) => {
          e.stopPropagation()
          setOpen((prev) => !prev)
        }}
        className="flex h-8 w-8 items-center justify-center rounded-lg border-0 bg-transparent text-muted transition hover:bg-gray-100 hover:text-primary"
      >
        <MoreVertical className="h-4 w-4" />
      </button>

      {open && (
        <div className="absolute right-0 z-10 mt-1 w-44 rounded-lg border border-gray-100 bg-white py-1 shadow-lg">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              setOpen(false)
              onSelect(row.id)
            }}
            className="block w-full border-0 bg-transparent px-4 py-2 text-left text-sm text-primary hover:bg-gray-50"
          >
            View
          </button>
          {row.accountStatus !== 'suspended' && row.accountStatus !== 'deleted' && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                setOpen(false)
                onSetStatus(row.id, 'suspended')
              }}
              className="block w-full border-0 bg-transparent px-4 py-2 text-left text-sm text-danger hover:bg-gray-50"
            >
              Suspend
            </button>
          )}
          {row.accountStatus !== 'active' && row.accountStatus !== 'deleted' && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                setOpen(false)
                onSetStatus(row.id, 'active')
              }}
              className="block w-full border-0 bg-transparent px-4 py-2 text-left text-sm text-success hover:bg-gray-50"
            >
              Activate
            </button>
          )}
        </div>
      )}
    </div>
  )
}

export default function CustomersTable({ rows, isLoading, error, selectedId, onSelect, onSetStatus }: CustomersTableProps) {
  if (error) {
    return <StateMessage variant="error" title="Unable to load customers" description={error} />
  }

  if (isLoading) {
    return (
      <div className="flex flex-col gap-3 py-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-14 w-full" />
        ))}
      </div>
    )
  }

  if (rows.length === 0) {
    return <StateMessage variant="empty" title="No customers found" description="Try adjusting your search or filters." />
  }

  return (
    <table className="w-full text-left text-sm">
      <thead>
        <tr className="border-b border-gray-100 bg-gray-50/60">
          <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-muted">Customer</th>
          <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-muted">Contact</th>
          <th className="px-6 py-3 text-center text-xs font-semibold uppercase tracking-wide text-muted">Status</th>
          <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wide text-muted">Action</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr
            key={row.id}
            onClick={() => onSelect(row.id)}
            className={`cursor-pointer border-b border-gray-50 transition hover:bg-primary/5 ${
              selectedId === row.id ? 'bg-primary/5' : ''
            }`}
          >
            <td className="px-6 py-4">
              <div className="flex items-center gap-3">
                <Avatar name={customerName(row)} photoUrl={row.profilePhotoUrl} size={40} />
                <div>
                  <p className="font-semibold text-primary">{customerName(row)}</p>
                  <p className="text-xs text-muted">ID: {shortId(row.id)}</p>
                </div>
              </div>
            </td>
            <td className="px-6 py-4">
              <p className="text-sm text-primary">{row.email ?? '—'}</p>
              <p className="text-xs text-muted">
                {row.countryCode ?? ''} {row.phoneNumber ?? ''}
              </p>
            </td>
            <td className="px-6 py-4 text-center">
              <CustomerStatusBadge status={row.accountStatus} />
            </td>
            <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
              <RowActionMenu row={row} onSelect={onSelect} onSetStatus={onSetStatus} />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
