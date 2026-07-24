interface FareFieldProps {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  helperText?: string
}

export default function FareField({ id, label, value, onChange, helperText }: FareFieldProps) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-muted">
        {label}
      </label>
      <input
        id={id}
        type="number"
        step="0.01"
        min={0}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-primary focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
      />
      {helperText && <p className="mt-1.5 text-xs text-muted">{helperText}</p>}
    </div>
  )
}
