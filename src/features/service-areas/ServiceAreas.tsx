import { Plus } from 'lucide-react'
import { useState } from 'react'
import AdminLayout from '../../components/layout/AdminLayout'
import Card from '../../components/ui/Card'
import ServiceAreaFormPanel from './components/ServiceAreaFormPanel'
import ServiceAreasTable from './components/ServiceAreasTable'
import { useServiceAreas } from './hooks/useServiceAreas'
import type { ServiceAreaRow } from '../../types/serviceAreas'

export default function ServiceAreas() {
  const areas = useServiceAreas()
  const [editing, setEditing] = useState<ServiceAreaRow | null>(null)
  const [isPanelOpen, setIsPanelOpen] = useState(false)

  function openAdd() {
    setEditing(null)
    setIsPanelOpen(true)
  }

  function openEdit(row: ServiceAreaRow) {
    setEditing(row)
    setIsPanelOpen(true)
  }

  return (
    <AdminLayout>
      <div className="flex flex-col gap-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-primary">Service Areas</h1>
            <p className="text-sm text-muted">Manage the provinces, districts, and zones where rides are offered.</p>
          </div>
          <button
            type="button"
            onClick={openAdd}
            className="flex items-center gap-2 rounded-button border-0 bg-accent px-4 py-2.5 text-sm font-bold text-white transition hover:brightness-110"
          >
            <Plus className="h-4 w-4" />
            Add New Area
          </button>
        </div>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-primary">Area Details</h2>
          </div>

          {areas.actionError && <p className="mt-3 text-sm font-semibold text-danger">{areas.actionError}</p>}

          <div className="mt-4 overflow-x-auto">
            <ServiceAreasTable
              rows={areas.areas}
              isLoading={areas.isLoading}
              error={areas.error}
              savingId={areas.savingId}
              onToggleStatus={(id, nextStatus) => void areas.toggleStatus(id, nextStatus)}
              onEdit={openEdit}
            />
          </div>
        </Card>
      </div>

      <ServiceAreaFormPanel
        key={isPanelOpen ? (editing?.id ?? 'new') : 'closed'}
        open={isPanelOpen}
        editing={editing}
        isSaving={areas.savingId !== null}
        onClose={() => setIsPanelOpen(false)}
        onSave={(input, id) => areas.save(input, id)}
      />
    </AdminLayout>
  )
}
