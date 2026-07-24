import { Info } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import SlideOver from '../../../components/ui/SlideOver'
import { usePolledQuery } from '../../../hooks/usePolledQuery'
import { normalizeLibraryValue } from '../../../lib/library'
import { fetchVehicleClasses } from '../../../lib/vehicleClasses'
import type { ServiceAreaInput, ServiceAreaRow, ServiceAreaStatus } from '../../../types/serviceAreas'
import LibraryAutocompleteField from './LibraryAutocompleteField'

interface ServiceAreaFormPanelProps {
  open: boolean
  editing: ServiceAreaRow | null
  isSaving: boolean
  onClose: () => void
  onSave: (input: ServiceAreaInput, id?: string) => Promise<void>
}

function emptyForm() {
  return { name: '', province: '', district: '', status: 'active' as ServiceAreaStatus, vehicleTypeIds: [] as string[] }
}

// Parent remounts this component (via `key`) whenever the panel opens or the
// editing target changes, so useState's initial value below is all that's
// needed to seed the form — no reset effect required.
export default function ServiceAreaFormPanel({ open, editing, isSaving, onClose, onSave }: ServiceAreaFormPanelProps) {
  const [name, setName] = useState(editing?.name ?? '')
  const [province, setProvince] = useState(editing?.province ?? '')
  const [district, setDistrict] = useState(editing?.district ?? '')
  const [status, setStatus] = useState<ServiceAreaStatus>(editing?.status ?? 'active')
  const [vehicleTypeIds, setVehicleTypeIds] = useState<string[]>(editing?.vehicleTypeIds ?? [])
  const [formError, setFormError] = useState<string | null>(null)

  const vehicleClasses = usePolledQuery(fetchVehicleClasses, [])

  function handleReset() {
    const empty = emptyForm()
    setName(editing?.name ?? empty.name)
    setProvince(editing?.province ?? empty.province)
    setDistrict(editing?.district ?? empty.district)
    setStatus(editing?.status ?? empty.status)
    setVehicleTypeIds(editing?.vehicleTypeIds ?? empty.vehicleTypeIds)
    setFormError(null)
  }

  function toggleVehicleType(id: string) {
    setVehicleTypeIds((current) => (current.includes(id) ? current.filter((v) => v !== id) : [...current, id]))
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setFormError(null)

    if (!name.trim()) {
      setFormError('Area name is required.')
      return
    }
    if (!province.trim()) {
      setFormError('Province is required.')
      return
    }
    if (!district.trim()) {
      setFormError('District is required.')
      return
    }

    const input: ServiceAreaInput = {
      name: name.trim(),
      province,
      district,
      status,
      vehicleTypeIds,
    }

    try {
      await onSave(input, editing?.id)
      onClose()
    } catch {
      // save error is surfaced via the hook's actionError; keep the panel open
    }
  }

  return (
    <SlideOver
      open={open}
      onClose={onClose}
      title="Add/Edit Service Area"
      subtitle={editing ? `Editing "${editing.name}"` : 'Define a new service area'}
      footer={
        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleReset}
            className="flex-1 rounded-button border border-gray-200 bg-white py-2.5 text-sm font-semibold text-primary transition hover:bg-gray-50"
          >
            Reset
          </button>
          <button
            type="submit"
            form="service-area-form"
            disabled={isSaving}
            className="flex-1 rounded-button border-0 bg-accent py-2.5 text-sm font-bold text-white transition hover:brightness-110 disabled:opacity-60"
          >
            {isSaving ? 'Saving…' : 'Save Area'}
          </button>
        </div>
      }
    >
      <form id="service-area-form" onSubmit={(e) => void handleSubmit(e)} className="flex flex-col gap-5">
        {formError && <p className="text-sm font-semibold text-danger">{formError}</p>}

        <div>
          <label htmlFor="sa-name" className="mb-1.5 block text-sm font-semibold text-primary">
            Area Name
          </label>
          <input
            id="sa-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Lusaka Central"
            className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-primary placeholder:text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <LibraryAutocompleteField
            id="sa-province"
            label="Province"
            category="province"
            value={province}
            onChange={setProvince}
            placeholder="e.g. Lusaka"
          />
          <LibraryAutocompleteField
            id="sa-district"
            label="District"
            category="district"
            parentValue={normalizeLibraryValue(province)}
            value={district}
            onChange={setDistrict}
            placeholder="e.g. Lusaka"
          />
        </div>

        <div>
          <label htmlFor="sa-status" className="mb-1.5 block text-sm font-semibold text-primary">
            Status
          </label>
          <select
            id="sa-status"
            value={status}
            onChange={(e) => setStatus(e.target.value as ServiceAreaStatus)}
            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm font-medium text-primary focus:border-accent focus:outline-none"
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        <div>
          <p className="mb-1.5 text-sm font-semibold text-primary">Vehicle Types</p>
          {vehicleClasses.isLoading ? (
            <p className="text-xs text-muted">Loading vehicle types…</p>
          ) : vehicleClasses.data && vehicleClasses.data.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {vehicleClasses.data.map((vc) => (
                <label
                  key={vc.id}
                  className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-1.5 text-sm font-medium transition ${
                    vehicleTypeIds.includes(vc.id)
                      ? 'border-accent bg-accent/10 text-accent'
                      : 'border-gray-200 bg-gray-50 text-primary'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={vehicleTypeIds.includes(vc.id)}
                    onChange={() => toggleVehicleType(vc.id)}
                    className="h-3.5 w-3.5"
                  />
                  {vc.name}
                </label>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted">No vehicle classes configured yet.</p>
          )}
        </div>

        <div className="flex items-start gap-2.5 rounded-lg bg-amber-50 p-3.5">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
          <p className="text-xs text-amber-800">
            <span className="font-semibold">Note:</span> Polygon boundary drawing and area code generation are
            configured separately and aren't part of this form yet.
          </p>
        </div>
      </form>
    </SlideOver>
  )
}
