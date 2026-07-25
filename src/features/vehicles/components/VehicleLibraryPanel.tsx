import { Plus, Trash2 } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import Card from '../../../components/ui/Card'
import Skeleton from '../../../components/ui/Skeleton'
import StateMessage from '../../../components/ui/StateMessage'
import type { LibraryEntry } from '../../../types/library'
import { useVehicleLibrary } from '../hooks/useVehicleLibrary'

function AddEntryForm({
  placeholder,
  disabled,
  isSaving,
  onAdd,
}: {
  placeholder: string
  disabled?: boolean
  isSaving: boolean
  onAdd: (value: string) => Promise<void>
}) {
  const [value, setValue] = useState('')
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!value.trim()) return
    setError(null)
    try {
      await onAdd(value)
      setValue('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to add entry.')
    }
  }

  return (
    <form onSubmit={(e) => void handleSubmit(e)} className="flex flex-col gap-1.5">
      <div className="flex gap-2">
        <input
          type="text"
          value={value}
          onChange={(e) => {
            setValue(e.target.value)
            setError(null)
          }}
          disabled={disabled}
          placeholder={placeholder}
          className="flex-1 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-primary placeholder:text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent disabled:cursor-not-allowed disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={disabled || isSaving || !value.trim()}
          className="flex items-center gap-1 rounded-button border-0 bg-accent px-3 py-2 text-xs font-bold text-white transition hover:brightness-110 disabled:opacity-50"
        >
          <Plus className="h-3.5 w-3.5" />
          Add
        </button>
      </div>
      {error && <p className="text-xs font-semibold text-danger">{error}</p>}
    </form>
  )
}

function EntryList({
  entries,
  emptyLabel,
  selectedId,
  onSelect,
  onDelete,
}: {
  entries: LibraryEntry[]
  emptyLabel: string
  selectedId?: string
  onSelect?: (entry: LibraryEntry) => void
  onDelete: (entry: LibraryEntry) => void
}) {
  if (entries.length === 0) {
    return <p className="py-6 text-center text-xs text-muted">{emptyLabel}</p>
  }

  return (
    <ul className="flex max-h-64 flex-col gap-1 overflow-y-auto">
      {entries.map((entry) => (
        <li key={entry.id}>
          <div
            role={onSelect ? 'button' : undefined}
            tabIndex={onSelect ? 0 : undefined}
            onClick={() => onSelect?.(entry)}
            onKeyDown={(e) => {
              if (onSelect && (e.key === 'Enter' || e.key === ' ')) onSelect(entry)
            }}
            className={`flex items-center justify-between gap-2 rounded-lg px-3 py-2 text-sm transition ${
              onSelect ? 'cursor-pointer' : ''
            } ${selectedId === entry.id ? 'bg-accent/10 font-semibold text-accent' : 'text-primary hover:bg-gray-50'}`}
          >
            <span className="truncate">{entry.value}</span>
            <button
              type="button"
              aria-label={`Delete ${entry.value}`}
              onClick={(e) => {
                e.stopPropagation()
                onDelete(entry)
              }}
              className="shrink-0 rounded-full border-0 bg-transparent p-1 text-muted transition hover:bg-danger/10 hover:text-danger"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </li>
      ))}
    </ul>
  )
}

export default function VehicleLibraryPanel() {
  const library = useVehicleLibrary()

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-primary">Vehicle Make &amp; Model Library</h2>
          <p className="text-sm text-muted">Reference values drivers select from during vehicle registration.</p>
        </div>
      </div>

      {library.actionError && <p className="mt-3 text-sm font-semibold text-danger">{library.actionError}</p>}

      {library.isLoading && (
        <div className="mt-4 grid grid-cols-2 gap-6">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      )}

      {!library.isLoading && library.error && (
        <div className="mt-4">
          <StateMessage variant="error" title="Unable to load the library" description={library.error} />
        </div>
      )}

      {!library.isLoading && !library.error && (
        <div className="mt-4 grid grid-cols-2 gap-6">
          <div className="flex flex-col gap-3 border-r border-gray-100 pr-6">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted">Makes</h3>
            <EntryList
              entries={library.makes}
              emptyLabel="No makes yet."
              selectedId={library.selectedMakeId ?? undefined}
              onSelect={(entry) => library.setSelectedMakeId(entry.id)}
              onDelete={(entry) => void library.removeEntry(entry)}
            />
            <AddEntryForm placeholder="e.g. Toyota" isSaving={library.isSaving} onAdd={library.addMake} />
          </div>

          <div className="flex flex-col gap-3">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted">
              {library.selectedMake ? `Models — ${library.selectedMake.value}` : 'Models'}
            </h3>
            <EntryList
              entries={library.modelsForSelectedMake}
              emptyLabel={library.selectedMake ? 'No models yet.' : 'Select a make to view its models.'}
              onDelete={(entry) => void library.removeEntry(entry)}
            />
            <AddEntryForm
              placeholder={library.selectedMake ? 'e.g. Corolla' : 'Select a make first'}
              disabled={!library.selectedMake}
              isSaving={library.isSaving}
              onAdd={library.addModel}
            />
          </div>
        </div>
      )}
    </Card>
  )
}
