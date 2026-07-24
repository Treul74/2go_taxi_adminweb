import { Plus } from 'lucide-react'
import { useState } from 'react'
import AdminLayout from '../../components/layout/AdminLayout'
import Card from '../../components/ui/Card'
import VehicleClassFormPanel from './components/VehicleClassFormPanel'
import VehicleClassStatCards from './components/VehicleClassStatCards'
import VehicleClassTable from './components/VehicleClassTable'
import { useVehicleClassStats } from './hooks/useVehicleClassStats'
import { useVehicleClasses } from './hooks/useVehicleClasses'
import type { VehicleClassRow } from '../../types/vehicleClasses'

export default function VehicleClasses() {
  const stats = useVehicleClassStats()
  const classes = useVehicleClasses()
  const [editing, setEditing] = useState<VehicleClassRow | null>(null)
  const [isPanelOpen, setIsPanelOpen] = useState(false)

  function openAdd() {
    setEditing(null)
    setIsPanelOpen(true)
  }

  function openEdit(row: VehicleClassRow) {
    setEditing(row)
    setIsPanelOpen(true)
  }

  async function handleSave(input: Parameters<typeof classes.save>[0], id?: string) {
    await classes.save(input, id)
    await stats.refetch()
  }

  return (
    <AdminLayout>
      <div className="flex flex-col gap-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-primary">Vehicle Classes</h1>
            <p className="text-sm text-muted">Configure and manage your global vehicle tier definitions.</p>
          </div>
          <button
            type="button"
            onClick={openAdd}
            className="flex items-center gap-2 rounded-button border-0 bg-accent px-4 py-2.5 text-sm font-bold text-white transition hover:brightness-110"
          >
            <Plus className="h-4 w-4" />
            Add New Class
          </button>
        </div>

        <VehicleClassStatCards stats={stats.stats} isLoading={stats.isLoading} error={stats.error} />

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-primary">Class Details</h2>
          </div>

          {classes.actionError && <p className="mt-3 text-sm font-semibold text-danger">{classes.actionError}</p>}

          <div className="mt-4 overflow-x-auto">
            <VehicleClassTable
              rows={classes.classes}
              isLoading={classes.isLoading}
              error={classes.error}
              savingId={classes.savingId}
              onToggleStatus={(id, nextStatus) => void classes.toggleStatus(id, nextStatus)}
              onEdit={openEdit}
            />
          </div>
        </Card>
      </div>

      <VehicleClassFormPanel
        key={isPanelOpen ? (editing?.id ?? 'new') : 'closed'}
        open={isPanelOpen}
        editing={editing}
        isSaving={classes.savingId !== null}
        onClose={() => setIsPanelOpen(false)}
        onSave={handleSave}
      />
    </AdminLayout>
  )
}
