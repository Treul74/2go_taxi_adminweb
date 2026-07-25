import { MoreVertical, X } from 'lucide-react'
import Badge from '../../../components/ui/Badge'
import { formatDateTime } from '../../../lib/format'
import type { ServiceAreaRow } from '../../../types/serviceAreas'

interface AreaInspectorCardProps {
  area: ServiceAreaRow
  isEditingGeometry: boolean
  isSaving: boolean
  hasDraftPoints: boolean
  onToggleStatus: () => void
  onEditGeometry: () => void
  onSaveGeometry: () => void
  onCancelGeometry: () => void
  onClose: () => void
}

export default function AreaInspectorCard({
  area,
  isEditingGeometry,
  isSaving,
  hasDraftPoints,
  onToggleStatus,
  onEditGeometry,
  onSaveGeometry,
  onCancelGeometry,
  onClose,
}: AreaInspectorCardProps) {
  return (
    <div className="absolute bottom-6 right-6 z-10 w-[340px] rounded-card bg-card p-5 shadow-xl">
      <div className="mb-3 flex items-start justify-between">
        <div className="flex items-center gap-2">
          <Badge tone={area.status === 'active' ? 'success' : 'danger'}>{area.status === 'active' ? 'Active' : 'Inactive'}</Badge>
          <span className="text-xs font-semibold text-muted">ID: {area.areaCode ?? '—'}</span>
        </div>
        <div className="flex items-center gap-1">
          <button type="button" aria-label="More options" className="rounded-full border-0 bg-transparent p-1 text-muted hover:bg-gray-100">
            <MoreVertical className="h-4 w-4" />
          </button>
          <button type="button" aria-label="Close" onClick={onClose} className="rounded-full border-0 bg-transparent p-1 text-muted hover:bg-gray-100">
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      <h3 className="mb-4 text-lg font-bold text-primary">{area.name}</h3>

      <div className="mb-4 grid grid-cols-2 gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted">Est. Demand</p>
          <p className="mt-0.5 text-sm font-bold capitalize text-primary">{area.estimatedDemand ?? '—'}</p>
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted">Fleet Size</p>
          <p className="mt-0.5 text-sm font-bold text-primary">{area.fleetSize} Units</p>
        </div>
      </div>

      <div className="mb-4 flex flex-col gap-2 border-t border-gray-100 pt-3 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-muted">Base Fare Multiplier</span>
          <span className="font-semibold text-primary">{area.baseFareMultiplier.toFixed(2)}x</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-muted">Service Types</span>
          <span className="font-semibold capitalize text-primary">{area.serviceTypes.join(', ') || '—'}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-muted">Last Updated</span>
          <span className="font-semibold text-primary">{formatDateTime(area.updatedAt)}</span>
        </div>
      </div>

      {isEditingGeometry ? (
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onCancelGeometry}
            className="flex-1 rounded-button border border-gray-200 bg-white py-2.5 text-sm font-semibold text-primary transition hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onSaveGeometry}
            disabled={isSaving || !hasDraftPoints}
            className="flex-1 rounded-button border-0 bg-accent py-2.5 text-sm font-bold text-white transition hover:brightness-110 disabled:opacity-60"
          >
            {isSaving ? 'Saving…' : 'Save Polygon'}
          </button>
        </div>
      ) : (
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onToggleStatus}
            disabled={isSaving}
            className="flex-1 rounded-button border-0 bg-primary py-2.5 text-sm font-bold text-white transition hover:brightness-110 disabled:opacity-60"
          >
            {area.status === 'active' ? 'Deactivate Area' : 'Activate Area'}
          </button>
          <button
            type="button"
            onClick={onEditGeometry}
            className="flex-1 rounded-button border border-gray-200 bg-white py-2.5 text-sm font-semibold text-primary transition hover:bg-gray-50"
          >
            Edit Geometry
          </button>
        </div>
      )}
    </div>
  )
}
