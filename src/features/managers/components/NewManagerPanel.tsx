import { useEffect, useRef, useState, type FormEvent } from 'react'
import SlideOver from '../../../components/ui/SlideOver'
import { normalizeLibraryValue, resolveLibraryValue, searchLibraryValues, titleCaseLibraryValue } from '../../../lib/library'
import type { ManagerInput } from '../../../types/managers'
import { useManagerRoles } from '../hooks/useManagerRoles'

interface NewManagerPanelProps {
  open: boolean
  isSaving: boolean
  onClose: () => void
  onSave: (input: ManagerInput) => Promise<void>
}

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

function LibraryAutocompleteField({
  id,
  label,
  value,
  onChange,
  category,
  parentValue,
  disabled,
  placeholder,
}: LibraryAutocompleteFieldProps) {
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
    blurTimeout.current = setTimeout(() => {
      setIsOpen(false)
      if (value.trim()) onChange(titleCaseLibraryValue(value))
    }, 150)
  }

  return (
    <div className="relative">
      <label htmlFor={id} className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-muted">
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

export default function NewManagerPanel({ open, isSaving, onClose, onSave }: NewManagerPanelProps) {
  const { roles } = useManagerRoles()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('')
  const [province, setProvince] = useState('')
  const [district, setDistrict] = useState('')
  const [formError, setFormError] = useState<string | null>(null)
  const [isResolving, setIsResolving] = useState(false)

  const effectiveRole = role || roles[0] || ''

  function handleReset() {
    setFullName('')
    setEmail('')
    setRole(roles[0] || 'Fleet Manager')
    setProvince('')
    setDistrict('')
    setFormError(null)
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setFormError(null)

    if (!fullName.trim()) return setFormError('Full name is required.')
    if (!email.trim() || !email.includes('@')) return setFormError('A valid work email is required.')
    if (!effectiveRole.trim()) return setFormError('Please select a role.')
    if (!province.trim()) return setFormError('Province is required.')
    if (!district.trim()) return setFormError('District is required.')

    setIsResolving(true)
    try {
      const resolvedProvince = await resolveLibraryValue('province', province)
      const resolvedDistrict = await resolveLibraryValue('district', district, normalizeLibraryValue(resolvedProvince))

      await onSave({
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        role: effectiveRole.trim(),
        province: resolvedProvince,
        district: resolvedDistrict,
      })
      handleReset()
      onClose()
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Unable to create manager.')
    } finally {
      setIsResolving(false)
    }
  }

  return (
    <SlideOver
      open={open}
      onClose={onClose}
      title="Add New Manager"
      subtitle="Grant administrative access to a new team member"
      footer={
        <div className="flex flex-col gap-3">
          <button
            type="submit"
            form="new-manager-form"
            disabled={isSaving || isResolving}
            className="w-full rounded-button border-0 bg-accent py-3 text-sm font-bold text-white shadow-sm transition hover:brightness-110 disabled:opacity-60"
          >
            {isSaving || isResolving ? 'Creating…' : 'Create Manager'}
          </button>
          <p className="text-center text-xs text-muted">
            An invitation link will be sent to their email address for password setup
          </p>
        </div>
      }
    >
      <form id="new-manager-form" onSubmit={(e) => void handleSubmit(e)} className="flex flex-col gap-5">
        {formError && <p className="text-sm font-semibold text-danger">{formError}</p>}

        <div>
          <label htmlFor="mgr-name" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-muted">
            FULL NAME
          </label>
          <input
            id="mgr-name"
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="e.g. Robert Fox"
            className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-primary placeholder:text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
          />
        </div>

        <div>
          <label htmlFor="mgr-email" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-muted">
            WORK EMAIL
          </label>
          <input
            id="mgr-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="email@2go.com"
            className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-primary placeholder:text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
          />
        </div>

        <div>
          <label htmlFor="mgr-role" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-muted">
            ROLE ASSIGNMENT
          </label>
          <select
            id="mgr-role"
            value={effectiveRole}
            onChange={(e) => setRole(e.target.value)}
            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm font-medium text-primary focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
          >
            {roles.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>

        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-wider text-muted">REGION ASSIGNMENT</p>
          <div className="flex flex-col gap-4 rounded-lg border border-gray-100 bg-gray-50/50 p-4">
            <LibraryAutocompleteField
              id="mgr-province"
              label="Province"
              value={province}
              onChange={(next) => setProvince(next)}
              category="province"
              placeholder="Select Region"
            />
            <LibraryAutocompleteField
              id="mgr-district"
              label="District"
              value={district}
              onChange={setDistrict}
              category="district"
              parentValue={normalizeLibraryValue(province)}
              disabled={!province.trim()}
              placeholder={province.trim() ? 'Select District' : 'Enter a province first'}
            />
          </div>
        </div>
      </form>
    </SlideOver>
  )
}
