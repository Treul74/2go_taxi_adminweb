import { Info, UploadCloud } from 'lucide-react'
import { useRef, useState, type FormEvent } from 'react'
import SlideOver from '../../../components/ui/SlideOver'
import { uploadVehicleClassIcon } from '../../../lib/vehicleClasses'
import type { VehicleClassInput, VehicleClassRow, VehicleClassStatus } from '../../../types/vehicleClasses'

interface VehicleClassFormPanelProps {
  open: boolean
  editing: VehicleClassRow | null
  isSaving: boolean
  onClose: () => void
  onSave: (input: VehicleClassInput, id?: string) => Promise<void>
}

function emptyForm() {
  return { name: '', maxCapacity: '', status: 'active' as VehicleClassStatus }
}

// Parent remounts this component (via `key`) whenever the panel opens or the
// editing target changes, so useState's initial value below is all that's
// needed to seed the form — no reset effect required.
export default function VehicleClassFormPanel({ open, editing, isSaving, onClose, onSave }: VehicleClassFormPanelProps) {
  const [name, setName] = useState(editing?.name ?? '')
  const [maxCapacity, setMaxCapacity] = useState(editing ? String(editing.maxCapacity) : '')
  const [status, setStatus] = useState<VehicleClassStatus>(editing?.status ?? 'active')
  const [iconPreview, setIconPreview] = useState<string | null>(editing?.iconSvgUrl ?? null)
  const [iconUpload, setIconUpload] = useState<{ url: string; key: string } | null>(null)
  const [isUploadingIcon, setIsUploadingIcon] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  function handleReset() {
    if (editing) {
      setName(editing.name)
      setMaxCapacity(String(editing.maxCapacity))
      setStatus(editing.status)
      setIconPreview(editing.iconSvgUrl)
    } else {
      const empty = emptyForm()
      setName(empty.name)
      setMaxCapacity(empty.maxCapacity)
      setStatus(empty.status)
      setIconPreview(null)
    }
    setIconUpload(null)
    setFormError(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  async function handleIconFile(file: File | undefined) {
    if (!file) return
    setFormError(null)
    setIsUploadingIcon(true)
    try {
      const result = await uploadVehicleClassIcon(file)
      setIconUpload(result)
      setIconPreview(result.url)
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Unable to upload icon.')
    } finally {
      setIsUploadingIcon(false)
    }
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setFormError(null)

    const capacity = Number(maxCapacity)
    if (!name.trim()) {
      setFormError('Class name is required.')
      return
    }
    if (!Number.isFinite(capacity) || capacity <= 0) {
      setFormError('Max capacity must be a positive number.')
      return
    }

    const input: VehicleClassInput = {
      name: name.trim(),
      maxCapacity: capacity,
      status,
      ...(iconUpload ? { iconSvgUrl: iconUpload.url, iconSvgKey: iconUpload.key } : {}),
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
      title="Add/Edit Vehicle Class"
      subtitle={editing ? `Editing "${editing.name}"` : 'Define a new vehicle tier'}
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
            form="vehicle-class-form"
            disabled={isSaving || isUploadingIcon}
            className="flex-1 rounded-button border-0 bg-accent py-2.5 text-sm font-bold text-white transition hover:brightness-110 disabled:opacity-60"
          >
            {isSaving ? 'Saving…' : 'Save Class'}
          </button>
        </div>
      }
    >
      <form id="vehicle-class-form" onSubmit={(e) => void handleSubmit(e)} className="flex flex-col gap-5">
        {formError && <p className="text-sm font-semibold text-danger">{formError}</p>}

        <div>
          <label htmlFor="vc-name" className="mb-1.5 block text-sm font-semibold text-primary">
            Class Name
          </label>
          <input
            id="vc-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Executive"
            className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-primary placeholder:text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
          />
        </div>

        <div>
          <p className="mb-1.5 text-sm font-semibold text-primary">SVG Icon</p>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex w-full flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-200 bg-gray-50 py-8 text-center transition hover:border-accent"
          >
            {iconPreview ? (
              <img src={iconPreview} alt="Icon preview" className="h-10 w-10" />
            ) : (
              <UploadCloud className="h-6 w-6 text-muted" />
            )}
            <span className="text-sm font-semibold text-primary">
              {isUploadingIcon ? 'Uploading…' : 'Click or drag to upload'}
            </span>
            <span className="text-xs text-muted">SVG format, max 50KB</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".svg,image/svg+xml"
            className="hidden"
            onChange={(e) => void handleIconFile(e.target.files?.[0])}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="vc-capacity" className="mb-1.5 block text-sm font-semibold text-primary">
              Max Capacity
            </label>
            <input
              id="vc-capacity"
              type="number"
              min={1}
              value={maxCapacity}
              onChange={(e) => setMaxCapacity(e.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-primary focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            />
          </div>
          <div>
            <label htmlFor="vc-status" className="mb-1.5 block text-sm font-semibold text-primary">
              Base Status
            </label>
            <select
              id="vc-status"
              value={status}
              onChange={(e) => setStatus(e.target.value as VehicleClassStatus)}
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm font-medium text-primary focus:border-accent focus:outline-none"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        <div className="flex items-start gap-2.5 rounded-lg bg-amber-50 p-3.5">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
          <p className="text-xs text-amber-800">
            <span className="font-semibold">Note:</span> Changes to vehicle classes will propagate to user apps within
            15 minutes of saving.
          </p>
        </div>
      </form>
    </SlideOver>
  )
}
