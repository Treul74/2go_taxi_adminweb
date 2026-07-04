import { GoogleMap, MarkerF, useJsApiLoader } from '@react-google-maps/api'
import { MapPin, Radar } from 'lucide-react'
import { useMemo, useState } from 'react'
import Card from '../../../components/ui/Card'
import Skeleton from '../../../components/ui/Skeleton'
import StateMessage from '../../../components/ui/StateMessage'
import type { LiveOperationsDriver } from '../../../types/dashboard'

interface LiveOperationsPanelProps {
  active: number
  idle: number
  offline: number
  drivers: LiveOperationsDriver[]
  isLoading: boolean
  error: string | null
}

const DEFAULT_CENTER = { lat: -13.5432, lng: 23.1046 }

const STATUS_COLOR: Record<LiveOperationsDriver['driverStatus'], string> = {
  active: '#00D26A',
  idle: '#FFB800',
  offline: '#7B8387',
}

const MAP_CONTAINER_STYLE = { width: '100%', height: '100%', borderRadius: '8px' }

export default function LiveOperationsPanel({
  active,
  idle,
  offline,
  drivers,
  isLoading,
  error,
}: LiveOperationsPanelProps) {
  const [trackingEnabled, setTrackingEnabled] = useState(false)

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_KEY,
  })

  const locatedDrivers = useMemo(
    () => drivers.filter((d): d is LiveOperationsDriver & { currentLat: number; currentLng: number } =>
      d.currentLat != null && d.currentLng != null,
    ),
    [drivers],
  )

  const center = useMemo(() => {
    if (locatedDrivers.length === 0) return DEFAULT_CENTER
    const avgLat = locatedDrivers.reduce((sum, d) => sum + d.currentLat, 0) / locatedDrivers.length
    const avgLng = locatedDrivers.reduce((sum, d) => sum + d.currentLng, 0) / locatedDrivers.length
    return { lat: avgLat, lng: avgLng }
  }, [locatedDrivers])

  return (
    <Card className="flex h-full flex-col p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-primary">Live Operations</h2>
        <button
          type="button"
          onClick={() => setTrackingEnabled((prev) => !prev)}
          className={`flex items-center gap-1.5 rounded-full border-0 px-3 py-1.5 text-xs font-bold transition ${
            trackingEnabled
              ? 'bg-danger/10 text-danger hover:bg-danger/20'
              : 'bg-gray-100 text-primary hover:bg-gray-200'
          }`}
        >
          <Radar className="h-3.5 w-3.5" />
          {trackingEnabled ? 'Turn Off Tracking' : 'Enable Tracking'}
        </button>
      </div>

      {error ? (
        <StateMessage variant="error" title="Unable to load live operations" description={error} />
      ) : (
        <div className="mt-4 flex items-center gap-6">
          <div>
            <p className="text-xs font-semibold text-success">Active</p>
            {isLoading ? <Skeleton className="mt-1 h-6 w-8" /> : <p className="text-lg font-bold text-primary">{active}</p>}
          </div>
          <div>
            <p className="text-xs font-semibold text-warning">Idle</p>
            {isLoading ? <Skeleton className="mt-1 h-6 w-8" /> : <p className="text-lg font-bold text-primary">{idle}</p>}
          </div>
          <div>
            <p className="text-xs font-semibold text-muted">Offline</p>
            {isLoading ? <Skeleton className="mt-1 h-6 w-8" /> : <p className="text-lg font-bold text-primary">{offline}</p>}
          </div>
        </div>
      )}

      <div className="relative mt-4 flex-1 overflow-hidden rounded-card">
        {!trackingEnabled ? (
          <div className="flex h-full flex-col items-center justify-center gap-2 rounded-card bg-gray-50 text-center">
            <MapPin className="h-6 w-6 text-muted" />
            <p className="text-sm font-semibold text-primary">Live tracking is off</p>
            <p className="max-w-[220px] text-xs text-muted">
              Turn on tracking to view driver locations on the map.
            </p>
          </div>
        ) : !import.meta.env.VITE_GOOGLE_MAPS_KEY ? (
          <StateMessage
            variant="empty"
            title="Map unavailable"
            description="Google Maps API key is not configured."
          />
        ) : !isLoaded ? (
          <Skeleton className="h-full w-full" />
        ) : (
          <>
            <span className="absolute left-3 top-3 z-10 flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-bold text-danger shadow">
              <span className="h-2 w-2 rounded-full bg-danger" />
              LIVE TRACKING ENABLED
            </span>
            <GoogleMap mapContainerStyle={MAP_CONTAINER_STYLE} center={center} zoom={12}>
              {locatedDrivers.map((driver) => (
                <MarkerF
                  key={driver.id}
                  position={{ lat: driver.currentLat, lng: driver.currentLng }}
                  title={`${driver.firstName} ${driver.lastName} — ${driver.driverStatus}`}
                  icon={{
                    path: window.google.maps.SymbolPath.CIRCLE,
                    scale: 7,
                    fillColor: STATUS_COLOR[driver.driverStatus],
                    fillOpacity: 1,
                    strokeColor: '#FFFFFF',
                    strokeWeight: 2,
                  }}
                />
              ))}
            </GoogleMap>
          </>
        )}
      </div>
    </Card>
  )
}
