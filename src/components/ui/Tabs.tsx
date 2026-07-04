interface TabItem<T extends string> {
  value: T
  label: string
}

interface TabsProps<T extends string> {
  items: TabItem<T>[]
  value: T
  onChange: (value: T) => void
}

export default function Tabs<T extends string>({ items, value, onChange }: TabsProps<T>) {
  return (
    <div className="flex items-center gap-6 border-b border-gray-200">
      {items.map((item) => (
        <button
          key={item.value}
          type="button"
          onClick={() => onChange(item.value)}
          className={`border-0 border-b-2 bg-transparent px-1 pb-3 text-sm font-semibold transition ${
            value === item.value
              ? 'border-accent text-accent'
              : 'border-transparent text-muted hover:text-primary'
          }`}
        >
          {item.label}
        </button>
      ))}
    </div>
  )
}
