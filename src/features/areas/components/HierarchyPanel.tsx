import { Building2, ChevronDown, ChevronRight, MapIcon, Navigation } from 'lucide-react'
import { useMemo, useState } from 'react'
import Skeleton from '../../../components/ui/Skeleton'
import StateMessage from '../../../components/ui/StateMessage'
import type { ServiceAreaRow } from '../../../types/serviceAreas'

interface HierarchyPanelProps {
  areas: ServiceAreaRow[]
  isLoading: boolean
  error: string | null
  searchTerm: string
  selectedAreaId: string | null
  onSelectArea: (id: string) => void
  /** Navigates the map to a province/district's location, in addition to the existing expand/collapse toggle. */
  onSelectProvince: (province: string) => void
  onSelectDistrict: (province: string, district: string) => void
  activeCount: number
  totalCount: number
}

function matchesSearch(area: ServiceAreaRow, term: string) {
  if (!term) return true
  const haystack = `${area.name} ${area.areaCode ?? ''}`.toLowerCase()
  return haystack.includes(term)
}

export default function HierarchyPanel({
  areas,
  isLoading,
  error,
  searchTerm,
  selectedAreaId,
  onSelectArea,
  onSelectProvince,
  onSelectDistrict,
  activeCount,
  totalCount,
}: HierarchyPanelProps) {
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set())

  const term = searchTerm.trim().toLowerCase()

  // Provinces/districts are plain text on each area row (library-backed free
  // text, not a separate FK table), so the tree is grouped directly off the
  // areas that already matched the current search.
  const tree = useMemo(() => {
    const matched = areas.filter((a) => matchesSearch(a, term))

    const provinceMap = new Map<string, Map<string, ServiceAreaRow[]>>()
    for (const area of matched) {
      if (!provinceMap.has(area.province)) provinceMap.set(area.province, new Map())
      const districtMap = provinceMap.get(area.province)!
      if (!districtMap.has(area.district)) districtMap.set(area.district, [])
      districtMap.get(area.district)!.push(area)
    }

    return Array.from(provinceMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([province, districtMap]) => ({
        province,
        districts: Array.from(districtMap.entries())
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([district, districtAreas]) => ({ district, areas: districtAreas })),
      }))
  }, [areas, term])

  function toggle(id: string) {
    setCollapsed((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const progressPct = totalCount === 0 ? 0 : Math.round((activeCount / totalCount) * 100)

  return (
    <aside className="flex h-full w-80 shrink-0 flex-col border-r border-gray-100 bg-card">
      <div className="border-b border-gray-100 px-5 py-5">
        <h2 className="text-lg font-bold text-primary">Hierarchy</h2>
        <p className="text-xs text-muted">Service network structure</p>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-3">
        {isLoading && (
          <div className="flex flex-col gap-2 px-2">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        )}

        {!isLoading && error && <StateMessage variant="error" title="Unable to load areas" description={error} />}

        {!isLoading && !error && tree.length === 0 && (
          <StateMessage variant="empty" title="No service areas found" description="Try a different search or add a new area." />
        )}

        {!isLoading &&
          !error &&
          tree.map(({ province, districts: provinceDistricts }) => {
            const provinceOpen = !collapsed.has(province)
            return (
              <div key={province} className="mb-1">
                <button
                  type="button"
                  onClick={() => {
                    toggle(province)
                    onSelectProvince(province)
                  }}
                  className="flex w-full items-center gap-2 rounded-lg border-0 bg-transparent px-2 py-2 text-left text-sm font-semibold text-primary transition hover:bg-gray-50"
                >
                  {provinceOpen ? <ChevronDown className="h-3.5 w-3.5 shrink-0 text-muted" /> : <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted" />}
                  <MapIcon className="h-4 w-4 shrink-0 text-accent" />
                  <span className="truncate">{province}</span>
                </button>

                {provinceOpen && (
                  <div className="ml-3 border-l border-gray-100 pl-2">
                    {provinceDistricts.map(({ district, areas: districtAreas }) => {
                      const districtKey = `${province}::${district}`
                      const districtOpen = !collapsed.has(districtKey)
                      return (
                        <div key={districtKey} className="mb-0.5">
                          <button
                            type="button"
                            onClick={() => {
                              toggle(districtKey)
                              onSelectDistrict(province, district)
                            }}
                            className="flex w-full items-center gap-2 rounded-lg border-0 bg-transparent px-2 py-2 text-left text-sm font-medium text-primary transition hover:bg-gray-50"
                          >
                            {districtOpen ? <ChevronDown className="h-3.5 w-3.5 shrink-0 text-muted" /> : <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted" />}
                            <Building2 className="h-4 w-4 shrink-0 text-muted" />
                            <span className="truncate">{district}</span>
                          </button>

                          {districtOpen && (
                            <div className="ml-3 flex flex-col gap-0.5 border-l border-gray-100 pl-2">
                              {districtAreas.map((area) => (
                                <button
                                  key={area.id}
                                  type="button"
                                  onClick={() => onSelectArea(area.id)}
                                  className={`flex w-full items-center gap-2 rounded-lg border-0 px-2 py-2 text-left text-sm transition ${
                                    selectedAreaId === area.id ? 'bg-gray-100 font-semibold text-primary' : 'bg-transparent text-primary hover:bg-gray-50'
                                  }`}
                                >
                                  <Navigation className="h-3.5 w-3.5 shrink-0 text-muted" />
                                  <span className="flex-1 truncate">{area.name}</span>
                                  <span
                                    className={`h-2 w-2 shrink-0 rounded-full ${area.status === 'active' ? 'bg-success' : 'bg-danger'}`}
                                    title={area.status === 'active' ? 'Active' : 'Inactive'}
                                  />
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
      </div>

      <div className="border-t border-gray-100 px-5 py-4">
        <div className="mb-2 flex items-center justify-between text-xs font-semibold text-muted">
          <span className="tracking-wide">ACTIVE AREAS</span>
          <span className="text-primary">
            {activeCount} / {totalCount}
          </span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
          <div className="h-full rounded-full bg-accent transition-all" style={{ width: `${progressPct}%` }} />
        </div>
      </div>
    </aside>
  )
}
