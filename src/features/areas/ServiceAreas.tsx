import { Bell, HelpCircle, Plus, Search } from 'lucide-react'
import { useState } from 'react'
import { useCurrentAdmin } from '../auth/useCurrentAdmin'
import Avatar from '../../components/ui/Avatar'
import Sidebar from '../../components/layout/Sidebar'
import StateMessage from '../../components/ui/StateMessage'
import { polygonCenter } from '../../lib/geo'
import { geocodeAddress } from '../../lib/mapsApi'
import AreaInspectorCard from './components/AreaInspectorCard'
import HierarchyPanel from './components/HierarchyPanel'
import NewServiceAreaPanel from './components/NewServiceAreaPanel'
import ServiceAreaMap from './components/ServiceAreaMap'
import { useServiceAreas } from './hooks/useServiceAreas'
import type { LatLng, ServiceAreaRow } from '../../types/serviceAreas'

const AREA_FOCUS_ZOOM = 15
const DISTRICT_FOCUS_ZOOM = 12
const PROVINCE_FOCUS_ZOOM = 9

/** An area's own saved center, falling back to its polygon's average for areas drawn before center_lat/center_lng existed. */
function resolveAreaCenter(area: ServiceAreaRow): LatLng | null {
  if (area.centerLat != null && area.centerLng != null) return { lat: area.centerLat, lng: area.centerLng }
  return polygonCenter(area.polygon)
}

function averageCenter(areas: ServiceAreaRow[]): LatLng | null {
  const points = areas.map(resolveAreaCenter).filter((p): p is LatLng => p !== null)
  if (points.length === 0) return null
  const sum = points.reduce((acc, p) => ({ lat: acc.lat + p.lat, lng: acc.lng + p.lng }), { lat: 0, lng: 0 })
  return { lat: sum.lat / points.length, lng: sum.lng / points.length }
}

export default function ServiceAreas() {
  const { admin } = useCurrentAdmin()
  const serviceAreas = useServiceAreas()

  const [searchTerm, setSearchTerm] = useState('')
  const [isNewAreaOpen, setIsNewAreaOpen] = useState(false)
  const [isEditingGeometry, setIsEditingGeometry] = useState(false)
  const [draftPoints, setDraftPoints] = useState<LatLng[]>([])
  const [focusLocation, setFocusLocation] = useState<LatLng | null>(null)
  const [focusZoom, setFocusZoom] = useState<number | null>(null)

  function handleSelectArea(id: string | null) {
    serviceAreas.setSelectedAreaId(id)
    setIsEditingGeometry(false)
    setDraftPoints([])

    const area = id ? serviceAreas.areas.find((a) => a.id === id) : null
    const center = area ? resolveAreaCenter(area) : null
    if (center) {
      setFocusLocation(center)
      setFocusZoom(AREA_FOCUS_ZOOM)
    }
  }

  async function handleSelectProvince(province: string) {
    const areasInProvince = serviceAreas.areas.filter((a) => a.province === province)
    const center = averageCenter(areasInProvince) ?? (await geocodeAddress(`${province}, Zambia`))
    if (center) {
      setFocusLocation(center)
      setFocusZoom(PROVINCE_FOCUS_ZOOM)
    }
  }

  async function handleSelectDistrict(province: string, district: string) {
    const areasInDistrict = serviceAreas.areas.filter((a) => a.province === province && a.district === district)
    const center = averageCenter(areasInDistrict) ?? (await geocodeAddress(`${district}, ${province}, Zambia`))
    if (center) {
      setFocusLocation(center)
      setFocusZoom(DISTRICT_FOCUS_ZOOM)
    }
  }

  function handleEditGeometry() {
    if (!serviceAreas.selectedArea) return
    setDraftPoints(serviceAreas.selectedArea.polygon)
    setIsEditingGeometry(true)
  }

  function handleCancelGeometry() {
    setIsEditingGeometry(false)
    setDraftPoints([])
  }

  async function handleSaveGeometry() {
    if (!serviceAreas.selectedArea) return
    await serviceAreas.savePolygon(serviceAreas.selectedArea.id, draftPoints)
    setIsEditingGeometry(false)
  }

  async function handleToggleStatus() {
    if (!serviceAreas.selectedArea) return
    const next = serviceAreas.selectedArea.status === 'active' ? 'inactive' : 'active'
    await serviceAreas.setStatus(serviceAreas.selectedArea.id, next)
  }

  async function handleCreateArea(input: Parameters<typeof serviceAreas.save>[0]) {
    await serviceAreas.save(input)
    setDraftPoints([])
    setIsEditingGeometry(true)
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-surface font-sans">
      <Sidebar />

      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex items-center gap-4 border-b border-gray-200 bg-white px-8 py-4">
          <div className="relative max-w-md flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input
              type="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search areas, codes, or managers..."
              className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-4 text-sm text-primary placeholder:text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            />
          </div>

          <div className="ml-auto flex items-center gap-3">
            <button type="button" aria-label="Notifications" className="rounded-full border-0 bg-transparent p-2 text-muted hover:bg-gray-100">
              <Bell className="h-5 w-5" />
            </button>
            <button type="button" aria-label="Help" className="rounded-full border-0 bg-transparent p-2 text-muted hover:bg-gray-100">
              <HelpCircle className="h-5 w-5" />
            </button>

            <div className="h-6 w-px bg-gray-200" />

            <button
              type="button"
              onClick={() => setIsNewAreaOpen(true)}
              className="flex items-center gap-1.5 rounded-button border-0 bg-accent px-4 py-2.5 text-sm font-bold text-white transition hover:brightness-105"
            >
              <Plus className="h-4 w-4" />
              New Service Area
            </button>

            <Avatar name={admin?.name ?? 'Admin User'} photoUrl={admin?.avatarUrl} size={40} />
          </div>
        </header>

        <div className="flex flex-1 overflow-hidden">
          <HierarchyPanel
            areas={serviceAreas.areas}
            isLoading={serviceAreas.isLoading}
            error={serviceAreas.error}
            searchTerm={searchTerm}
            selectedAreaId={serviceAreas.selectedAreaId}
            onSelectArea={handleSelectArea}
            onSelectProvince={(province) => void handleSelectProvince(province)}
            onSelectDistrict={(province, district) => void handleSelectDistrict(province, district)}
            activeCount={serviceAreas.activeCount}
            totalCount={serviceAreas.totalCount}
          />

          <main className="relative flex-1 overflow-hidden">
            {serviceAreas.error && !serviceAreas.isLoading ? (
              <div className="flex h-full items-center justify-center">
                <StateMessage variant="error" title="Unable to load service areas" description={serviceAreas.error} />
              </div>
            ) : (
              <ServiceAreaMap
                areas={serviceAreas.areas}
                selectedArea={serviceAreas.selectedArea}
                onSelectArea={handleSelectArea}
                activeTrips={serviceAreas.activeTrips}
                isEditingGeometry={isEditingGeometry}
                draftPoints={draftPoints}
                onDraftPointsChange={setDraftPoints}
                focusLocation={focusLocation}
                focusZoom={focusZoom}
              />
            )}

            {serviceAreas.selectedArea && (
              <AreaInspectorCard
                area={serviceAreas.selectedArea}
                isEditingGeometry={isEditingGeometry}
                isSaving={serviceAreas.isSaving}
                hasDraftPoints={draftPoints.length >= 3}
                onToggleStatus={() => void handleToggleStatus()}
                onEditGeometry={handleEditGeometry}
                onSaveGeometry={() => void handleSaveGeometry()}
                onCancelGeometry={handleCancelGeometry}
                onClose={() => handleSelectArea(null)}
              />
            )}
          </main>
        </div>
      </div>

      <NewServiceAreaPanel
        key={isNewAreaOpen ? 'open' : 'closed'}
        open={isNewAreaOpen}
        isSaving={serviceAreas.isSaving}
        onClose={() => setIsNewAreaOpen(false)}
        onSave={handleCreateArea}
      />
    </div>
  )
}
