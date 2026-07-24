import { useEffect, useRef, useState } from 'react'
import { searchLibraryValues, titleCaseLibraryValue } from '../../../lib/library'

interface LibraryAutocompleteFieldProps {
  id: string
  label: string
  category: string
  /** Scopes suggestions to a parent category's normalized_value (e.g. the chosen province for a district field). Omit for unscoped categories. */
  parentValue?: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  helperText?: string
}

const DEBOUNCE_MS = 200

export default function LibraryAutocompleteField({
  id,
  label,
  category,
  parentValue,
  value,
  onChange,
  placeholder,
  helperText,
}: LibraryAutocompleteFieldProps) {
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const requestIdRef = useRef(0)

  useEffect(() => {
    // Disabled (no parent selected yet): skip fetching. `isDisabled` below
    // keeps any stale suggestions from rendering while in this state.
    if (parentValue !== undefined && !parentValue) return

    const requestId = ++requestIdRef.current
    const timer = setTimeout(() => {
      searchLibraryValues(category, value, parentValue)
        .then((results) => {
          if (requestId === requestIdRef.current) setSuggestions(results)
        })
        .catch(() => {
          if (requestId === requestIdRef.current) setSuggestions([])
        })
    }, DEBOUNCE_MS)

    return () => clearTimeout(timer)
  }, [category, parentValue, value])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function handleBlur() {
    setIsOpen(false)
    if (value.trim()) onChange(titleCaseLibraryValue(value))
  }

  const isDisabled = parentValue !== undefined && !parentValue

  return (
    <div ref={containerRef} className="relative">
      <label htmlFor={id} className="mb-1.5 block text-sm font-semibold text-primary">
        {label}
      </label>
      <input
        id={id}
        type="text"
        autoComplete="off"
        value={value}
        disabled={isDisabled}
        placeholder={isDisabled ? 'Select a province first' : placeholder}
        onChange={(e) => {
          onChange(e.target.value)
          setIsOpen(true)
        }}
        onFocus={() => setIsOpen(true)}
        onBlur={handleBlur}
        className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-primary placeholder:text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent disabled:opacity-60"
      />
      {helperText && !isOpen && <p className="mt-1 text-xs text-muted">{helperText}</p>}
      {isOpen && !isDisabled && suggestions.length > 0 && (
        <ul className="absolute z-10 mt-1 max-h-48 w-full overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg">
          {suggestions.map((suggestion) => (
            <li key={suggestion}>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
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
