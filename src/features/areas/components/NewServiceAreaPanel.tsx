import { useEffect, useRef, useState, type FormEvent } from 'react'
import SlideOver from '../../../components/ui/SlideOver'
import { normalizeLibraryValue, resolveLibraryValue, searchLibraryValues, titleCaseLibraryValue } from '../../../lib/library'
import type { EstimatedDemand, ServiceAreaInput } from '../../../types/serviceAreas'

interface NewServiceAreaPanelProps {
  open: boolean
  isSaving: boolean
  onClose: () => void
  onSave: (input: ServiceAreaInput) => Promise<void>
}

const SERVICE_TYPE_OPTIONS = ['economy', 'comfort', 'bike', 'tricycle', 'truck']
const DEMAND_OPTIONS: EstimatedDemand[] = ['low', 'medium', 'high']

interface LibraryAutocompleteFieldProps {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  category: 'province' | 'district'
  parentValue?: string
  disabled?: boolean
  placeholder: string
}

/** Free-text input backed by the `library` table: live autocomplete while typing, title-cased on blur. */
function LibraryAutocompleteField({ id, label, value, onChange, category, parentValue, disabled, placeholder }: LibraryAutocompleteFieldProps) {
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const blurTimeout = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  useEffect(() => {
    if (disabled) return
    const timeoutId = setTimeout(() => {
      searchLibraryValues(category, value, parentValue)
        .then(setSuggestions)
        .catch(() => setSuggestions([]))
    }, 200)
    return () => clearTimeout(timeoutId)
  }, [category, parentValue, value, disabled])

  function handleBlur() {
    // Delay so a suggestion click (which also blurs the input) can register first.
    blurTimeout.current = setTimeout(() => {
      setIsOpen(false)
      if (value.trim()) onChange(titleCaseLibraryValue(value))
    }, 150)
  }

  return (
    <div className="relative">
      <label htmlFor={id} className="mb-1.5 block text-sm font-semibold text-primary">
        {label}
      </label>
      <input
        id={id}
        type="text"
        autoComplete="off"
        value={value}
        disabled={disabled}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setIsOpen(true)}
        onBlur={handleBlur}
        className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-primary placeholder:text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent disabled:cursor-not-allowed disabled:opacity-60"
      />
      {isOpen && !disabled && suggestions.length > 0 && (
        <ul className="absolute z-10 mt-1 w-full overflow-hidden rounded-lg border border-gray-100 bg-card shadow-lg">
          {suggestions.map((suggestion) => (
            <li key={suggestion}>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  if (blurTimeout.current) clearTimeout(blurTimeout.current)
                  onChange(suggestion)
                  setIsOpen(false)
                }}
                className="block w-full border-0 bg-transparent px-3 py-2 text-left text-sm text-primary hover:bg-gray-50"
              >
                {suggestion}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default function NewServiceAreaPanel({ open, isSaving, onClose, onSave }: NewServiceAreaPanelProps) {
  const [province, setProvince] = useState('')
  const [district, setDistrict] = useState('')
  const [name, setName] = useState('')
  const [areaCode, setAreaCode] = useState('')
  const [estimatedDemand, setEstimatedDemand] = useState<EstimatedDemand>('medium')
  const [fleetSize, setFleetSize] = useState('0')
  const [baseFareMultiplier, setBaseFareMultiplier] = useState('1.0')
  const [serviceTypes, setServiceTypes] = useState<string[]>(['economy'])
  const [formError, setFormError] = useState<string | null>(null)
  const [isResolving, setIsResolving] = useState(false)

  function toggleServiceType(type: string) {
    setServiceTypes((prev) => (prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]))
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setFormError(null)

    if (!name.trim()) return setFormError('Area name is required.')
    if (!province.trim()) return setFormError('Province is required.')
    if (!district.trim()) return setFormError('District is required.')
    if (serviceTypes.length === 0) return setFormError('Select at least one service type.')

    const fleet = Number(fleetSize)
    const multiplier = Number(baseFareMultiplier)
    if (!Number.isFinite(fleet) || fleet < 0) return setFormError('Fleet size must be a non-negative number.')
    if (!Number.isFinite(multiplier) || multiplier <= 0) return setFormError('Base fare multiplier must be a positive number.')

    setIsResolving(true)
    try {
      const resolvedProvince = await resolveLibraryValue('province', province)
      const resolvedDistrict = await resolveLibraryValue('district', district, normalizeLibraryValue(resolvedProvince))

      await onSave({
        province: resolvedProvince,
        district: resolvedDistrict,
        name: name.trim(),
        areaCode: areaCode.trim(),
        estimatedDemand,
        fleetSize: fleet,
        baseFareMultiplier: multiplier,
        serviceTypes,
      })
      onClose()
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Unable to create service area.')
    } finally {
      setIsResolving(false)
    }
  }

  return (
    <SlideOver
      open={open}
      onClose={onClose}
      title="New Service Area"
      subtitle="Define the area, then draw its boundary on the map"
      footer={
        <button
          type="submit"
          form="new-service-area-form"
          disabled={isSaving || isResolving}
          className="w-full rounded-button border-0 bg-accent py-2.5 text-sm font-bold text-white transition hover:brightness-110 disabled:opacity-60"
        >
          {isSaving || isResolving ? 'Creating…' : 'Create & Draw Boundary'}
        </button>
      }
    >
      <form id="new-service-area-form" onSubmit={(e) => void handleSubmit(e)} className="flex flex-col gap-5">
        {formError && <p className="text-sm font-semibold text-danger">{formError}</p>}

        <div className="grid grid-cols-2 gap-4">
          <LibraryAutocompleteField
            id="sa-province"
            label="Province"
            value={province}
            onChange={(next) => setProvince(next)}
            category="province"
            placeholder="e.g. North Western"
          />
          <LibraryAutocompleteField
            id="sa-district"
            label="District"
            value={district}
            onChange={setDistrict}
            category="district"
            parentValue={normalizeLibraryValue(province)}
            disabled={!province.trim()}
            placeholder={province.trim() ? 'e.g. Zambezi' : 'Enter a province first'}
          />
        </div>

        <div>
          <label htmlFor="sa-name" className="mb-1.5 block text-sm font-semibold text-primary">
            Area Name
          </label>
          <input
            id="sa-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Downtown Core"
            className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-primary placeholder:text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
          />
        </div>

        <div>
          <label htmlFor="sa-code" className="mb-1.5 block text-sm font-semibold text-primary">
            Area Code
          </label>
          <input
            id="sa-code"
            type="text"
            value={areaCode}
            onChange={(e) => setAreaCode(e.target.value)}
            placeholder="e.g. ON-DT-001"
            className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-primary placeholder:text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="sa-demand" className="mb-1.5 block text-sm font-semibold text-primary">
              Est. Demand
            </label>
            <select
              id="sa-demand"
              value={estimatedDemand}
              onChange={(e) => setEstimatedDemand(e.target.value as EstimatedDemand)}
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm font-medium capitalize text-primary focus:border-accent focus:outline-none"
            >
              {DEMAND_OPTIONS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="sa-fleet" className="mb-1.5 block text-sm font-semibold text-primary">
              Fleet Size
            </label>
            <input
              id="sa-fleet"
              type="number"
              min={0}
              value={fleetSize}
              onChange={(e) => setFleetSize(e.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-primary focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            />
          </div>
        </div>

        <div>
          <label htmlFor="sa-multiplier" className="mb-1.5 block text-sm font-semibold text-primary">
            Base Fare Multiplier
          </label>
          <input
            id="sa-multiplier"
            type="number"
            min={0.1}
            step={0.05}
            value={baseFareMultiplier}
            onChange={(e) => setBaseFareMultiplier(e.target.value)}
            className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-primary focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
          />
        </div>

        <div>
          <p className="mb-1.5 text-sm font-semibold text-primary">Service Types</p>
          <div className="flex flex-wrap gap-2">
            {SERVICE_TYPE_OPTIONS.map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => toggleServiceType(type)}
                className={`rounded-full border px-3 py-1.5 text-xs font-semibold capitalize transition ${
                  serviceTypes.includes(type) ? 'border-accent bg-accent/10 text-accent' : 'border-gray-200 bg-white text-muted hover:bg-gray-50'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>
      </form>
    </SlideOver>
  )
}
