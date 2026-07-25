import { CircleF, GoogleMap, MarkerF, PolygonF, PolylineF, useJsApiLoader } from '@react-google-maps/api'
import { Car, Hand, MapPin, Minus, Plus, Share2, Trash2 } from 'lucide-react'
import { useRef, useState } from 'react'
import Skeleton from '../../../components/ui/Skeleton'
import StateMessage from '../../../components/ui/StateMessage'
import { formatCompactNumber } from '../../../lib/format'
import { nearestEdgeInsertIndex } from '../../../lib/geo'
import type { LatLng, ServiceAreaRow } from '../../../types/serviceAreas'

/** Below this many points there's no real edge to drag/right-click-insert on yet — points are placed by clicking the map instead (see MIN_EDITABLE_POINTS usage below). */
const MIN_EDITABLE_POINTS = 3

type ToolMode = 'pan' | 'draw' | 'point' | 'delete'

interface ServiceAreaMapProps {
  areas: ServiceAreaRow[]
  selectedArea: ServiceAreaRow | null
  onSelectArea: (id: string) => void
  activeTrips: number
  isEditingGeometry: boolean
  draftPoints: LatLng[]
  onDraftPointsChange: (points: LatLng[]) => void
  /** Set when the Hierarchy tree navigates the map to an area/district/province; null leaves the map at its normal selection/draft-driven center. */
  focusLocation: LatLng | null
  focusZoom: number | null
}

const MAP_CONTAINER_STYLE = { width: '100%', height: '100%' }
const DEFAULT_CENTER: LatLng = { lat: -13.1339, lng: 27.8493 }
const DEFAULT_ZOOM = 12

const MAP_OPTIONS: google.maps.MapOptions = {
  disableDefaultUI: true,
  clickableIcons: false,
}

const DASHED_LINE_OPTIONS: google.maps.PolylineOptions = {
  strokeColor: '#FE5035',
  strokeOpacity: 0,
  icons: [{ icon: { path: 'M 0,-1 0,1', strokeOpacity: 1, strokeColor: '#FE5035', scale: 3 }, offset: '0', repeat: '12px' }],
  zIndex: 4,
}

function centroid(points: LatLng[]): LatLng | null {
  if (points.length === 0) return null
  const sum = points.reduce((acc, p) => ({ lat: acc.lat + p.lat, lng: acc.lng + p.lng }), { lat: 0, lng: 0 })
  return { lat: sum.lat / points.length, lng: sum.lng / points.length }
}

const TOOLS: { mode: ToolMode; icon: typeof Hand; label: string }[] = [
  { mode: 'pan', icon: Hand, label: 'Pan' },
  { mode: 'draw', icon: Share2, label: 'Draw Polygon' },
  { mode: 'point', icon: MapPin, label: 'Add Point' },
  { mode: 'delete', icon: Trash2, label: 'Delete point' },
]

export default function ServiceAreaMap({
  areas,
  selectedArea,
  onSelectArea,
  activeTrips,
  isEditingGeometry,
  draftPoints,
  onDraftPointsChange,
  focusLocation,
  focusZoom,
}: ServiceAreaMapProps) {
  const { isLoaded } = useJsApiLoader({ googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_KEY })
  const [toolMode, setToolMode] = useState<ToolMode>('pan')
  const mapRef = useRef<google.maps.Map | null>(null)
  const editablePolygonRef = useRef<google.maps.Polygon | null>(null)

  const isNativeEditMode = isEditingGeometry && draftPoints.length >= MIN_EDITABLE_POINTS

  // Reset the active tool whenever geometry editing starts/stops. Adjusting state during render
  // (rather than in an effect) avoids an extra "stale tool" render/click cycle
  // (react.dev/learn/you-might-not-need-an-effect#adjusting-some-state-when-a-prop-changes).
  const [prevIsEditingGeometry, setPrevIsEditingGeometry] = useState(isEditingGeometry)
  if (isEditingGeometry !== prevIsEditingGeometry) {
    setPrevIsEditingGeometry(isEditingGeometry)
    setToolMode(isEditingGeometry ? 'draw' : 'pan')
  }

  // The editable <PolygonF>'s `path` prop must stay referentially stable while it's mounted —
  // Google Maps owns vertex positions once editable, and re-passing a fresh array every render
  // (which draftPoints becomes on every drag/insert) would fight the user's in-progress edit by
  // calling setPath() underneath them. So the initial path is captured once, only at the moment
  // native editing starts, and never re-derived from draftPoints while it stays active — ongoing
  // sync back to draftPoints flows the other way, via handlePolygonEdit below.
  const [initialEditPath, setInitialEditPath] = useState<LatLng[]>(draftPoints)
  const [wasNativeEditMode, setWasNativeEditMode] = useState(isNativeEditMode)
  if (isNativeEditMode !== wasNativeEditMode) {
    setWasNativeEditMode(isNativeEditMode)
    if (isNativeEditMode) setInitialEditPath(draftPoints)
  }

  function handleMapClick(event: google.maps.MapMouseEvent) {
    if (!isEditingGeometry || !event.latLng) return
    if (draftPoints.length >= MIN_EDITABLE_POINTS) return // once editable, growing the shape happens via right-click-insert
    if (toolMode !== 'draw' && toolMode !== 'point') return
    onDraftPointsChange([...draftPoints, { lat: event.latLng.lat(), lng: event.latLng.lng() }])
  }

  function handleVertexClick(index: number) {
    if (!isEditingGeometry || toolMode !== 'delete') return
    onDraftPointsChange(draftPoints.filter((_, i) => i !== index))
  }

  function handleVertexDragEnd(index: number, event: google.maps.MapMouseEvent) {
    if (!event.latLng) return
    const next = [...draftPoints]
    next[index] = { lat: event.latLng.lat(), lng: event.latLng.lng() }
    onDraftPointsChange(next)
  }

  /** Fires on native vertex drag, native right-click-vertex-remove, and drag of the whole shape — keeps draftPoints in sync with whatever Google Maps' own path now holds. */
  function handlePolygonEdit() {
    const path = editablePolygonRef.current?.getPath()
    if (!path) return
    onDraftPointsChange(path.getArray().map((latLng) => ({ lat: latLng.lat(), lng: latLng.lng() })))
  }

  /** Right-click on the polygon's edge/interior (not a vertex) inserts a new vertex at the nearest edge. */
  function handlePolygonRightClick(event: google.maps.MapMouseEvent) {
    const polygon = editablePolygonRef.current
    if (!polygon || !event.latLng) return

    const path = polygon.getPath()
    const ring = path.getArray().map((latLng) => ({ lat: latLng.lat(), lng: latLng.lng() }))
    const insertIndex = nearestEdgeInsertIndex({ lat: event.latLng.lat(), lng: event.latLng.lng() }, ring)
    path.insertAt(insertIndex, event.latLng)
  }

  // A tree-driven focus location always wins, except while actively drawing/editing — the
  // draft polygon's own growing shape should stay in view instead of a stale tree selection.
  const center =
    (!isEditingGeometry ? focusLocation : null) ??
    centroid(isEditingGeometry ? draftPoints : (selectedArea?.polygon ?? [])) ??
    centroid(areas.flatMap((a) => a.polygon)) ??
    DEFAULT_CENTER
  const zoom = (!isEditingGeometry && focusZoom) || DEFAULT_ZOOM

  if (!import.meta.env.VITE_GOOGLE_MAPS_KEY) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-gray-50">
        <StateMessage variant="empty" title="Map unavailable" description="Google Maps API key is not configured." />
      </div>
    )
  }

  if (!isLoaded) return <Skeleton className="h-full w-full" />

  return (
    <div className="relative h-full w-full">
      <GoogleMap
        mapContainerStyle={MAP_CONTAINER_STYLE}
        center={center}
        zoom={zoom}
        options={MAP_OPTIONS}
        onClick={handleMapClick}
        onLoad={(map) => {
          mapRef.current = map
        }}
      >
        {areas
          .filter((area) => area.id !== selectedArea?.id && area.areaType === 'polygon' && area.polygon.length > 0)
          .map((area) => (
            <PolygonF
              key={area.id}
              path={area.polygon}
              options={{
                fillColor: '#FE5035',
                fillOpacity: 0.18,
                strokeOpacity: 0,
                clickable: !isEditingGeometry,
                zIndex: 1,
              }}
              onClick={() => onSelectArea(area.id)}
            />
          ))}

        {areas
          .filter((area) => area.id !== selectedArea?.id && area.areaType === 'radius' && area.centerLat != null && area.centerLng != null && area.radiusMeters != null)
          .map((area) => (
            <CircleF
              key={area.id}
              center={{ lat: area.centerLat as number, lng: area.centerLng as number }}
              radius={area.radiusMeters as number}
              options={{
                fillColor: '#FE5035',
                fillOpacity: 0.18,
                strokeOpacity: 0,
                clickable: !isEditingGeometry,
                zIndex: 1,
              }}
              onClick={() => onSelectArea(area.id)}
            />
          ))}

        {selectedArea && !isEditingGeometry && selectedArea.areaType === 'polygon' && selectedArea.polygon.length > 0 && (
          <>
            <PolygonF
              path={selectedArea.polygon}
              options={{ fillColor: '#FE5035', fillOpacity: 0.15, strokeOpacity: 0, zIndex: 2 }}
            />
            <PolylineF path={[...selectedArea.polygon, selectedArea.polygon[0]]} options={DASHED_LINE_OPTIONS} />
          </>
        )}

        {selectedArea &&
          !isEditingGeometry &&
          selectedArea.areaType === 'radius' &&
          selectedArea.centerLat != null &&
          selectedArea.centerLng != null &&
          selectedArea.radiusMeters != null && (
            <CircleF
              center={{ lat: selectedArea.centerLat, lng: selectedArea.centerLng }}
              radius={selectedArea.radiusMeters}
              options={{ fillColor: '#FE5035', fillOpacity: 0.15, strokeColor: '#FE5035', strokeOpacity: 0.9, strokeWeight: 2, zIndex: 2 }}
            />
          )}

        {/* Bootstrap phase: fewer than MIN_EDITABLE_POINTS, so there's no real edge yet — build
            the shape by clicking the map, drag markers to adjust, delete-tool to remove one. */}
        {isEditingGeometry && draftPoints.length > 0 && draftPoints.length < MIN_EDITABLE_POINTS && (
          <PolylineF path={draftPoints} options={DASHED_LINE_OPTIONS} />
        )}

        {isEditingGeometry &&
          draftPoints.length < MIN_EDITABLE_POINTS &&
          draftPoints.map((point, index) => (
            <MarkerF
              key={index}
              position={point}
              draggable
              onDragEnd={(e) => handleVertexDragEnd(index, e)}
              onClick={() => handleVertexClick(index)}
              icon={{
                path: window.google.maps.SymbolPath.CIRCLE,
                scale: 6,
                fillColor: '#FE5035',
                fillOpacity: 1,
                strokeColor: '#FFFFFF',
                strokeWeight: 2,
              }}
            />
          ))}

        {/* Once the shape is a real polygon, hand it to Google Maps' native editable/draggable
            handling: drag a vertex to move it, right-click a vertex to remove it (both built in),
            right-click an edge/interior to insert a new vertex nearby (handlePolygonRightClick). */}
        {isNativeEditMode && (
          <PolygonF
            path={initialEditPath}
            editable
            draggable
            options={{ fillColor: '#FE5035', fillOpacity: 0.15, strokeColor: '#FE5035', strokeOpacity: 0.9, strokeWeight: 2, zIndex: 3 }}
            onLoad={(polygon) => {
              editablePolygonRef.current = polygon
            }}
            onUnmount={() => {
              editablePolygonRef.current = null
            }}
            onEdit={handlePolygonEdit}
            onDragEnd={handlePolygonEdit}
            onRightClick={handlePolygonRightClick}
          />
        )}
      </GoogleMap>

      <div className="absolute left-4 top-4 z-10 flex flex-col gap-1 rounded-card bg-card p-1.5 shadow-lg">
        {TOOLS.map(({ mode, icon: Icon, label }) => (
          <button
            key={mode}
            type="button"
            title={label}
            aria-label={label}
            disabled={mode !== 'pan' && (!isEditingGeometry || isNativeEditMode)}
            onClick={() => setToolMode(mode)}
            className={`flex h-9 w-9 items-center justify-center rounded-lg border-0 transition disabled:cursor-not-allowed disabled:opacity-30 ${
              toolMode === mode ? 'bg-primary text-white' : mode === 'delete' ? 'bg-transparent text-danger hover:bg-gray-100' : 'bg-transparent text-primary hover:bg-gray-100'
            }`}
          >
            <Icon className="h-4 w-4" />
          </button>
        ))}
      </div>

      <div className="absolute left-4 top-[13.5rem] z-10 flex flex-col gap-1 rounded-card bg-card p-1.5 shadow-lg">
        <button
          type="button"
          aria-label="Zoom in"
          onClick={() => mapRef.current?.setZoom((mapRef.current.getZoom() ?? 12) + 1)}
          className="flex h-9 w-9 items-center justify-center rounded-lg border-0 bg-transparent text-primary transition hover:bg-gray-100"
        >
          <Plus className="h-4 w-4" />
        </button>
        <button
          type="button"
          aria-label="Zoom out"
          onClick={() => mapRef.current?.setZoom((mapRef.current.getZoom() ?? 12) - 1)}
          className="flex h-9 w-9 items-center justify-center rounded-lg border-0 bg-transparent text-primary transition hover:bg-gray-100"
        >
          <Minus className="h-4 w-4" />
        </button>
      </div>

      <div className="absolute right-6 top-4 z-10 flex items-center gap-2">
        <span className="flex items-center gap-2 rounded-full bg-card px-3.5 py-2 text-xs font-semibold text-primary shadow-lg">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
          </span>
          Real-time Demand Monitoring
        </span>
        <span className="flex items-center gap-1.5 rounded-full bg-card px-3.5 py-2 text-xs font-semibold text-primary shadow-lg">
          <Car className="h-3.5 w-3.5 text-accent" />
          {formatCompactNumber(activeTrips)} Active Trips
        </span>
      </div>
    </div>
  )
}
