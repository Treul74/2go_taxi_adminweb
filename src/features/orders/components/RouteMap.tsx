import { GoogleMap, MarkerF, PolylineF, useJsApiLoader } from '@react-google-maps/api'
import { useMemo } from 'react'
import Skeleton from '../../../components/ui/Skeleton'
import StateMessage from '../../../components/ui/StateMessage'

interface LatLng {
  lat: number
  lng: number
}

interface RouteMapProps {
  pickup: LatLng | null
  dropoff: LatLng | null
  etaMinutes: number | null
}

const MAP_CONTAINER_STYLE = { width: '100%', height: '220px', borderRadius: '8px' }

export default function RouteMap({ pickup, dropoff, etaMinutes }: RouteMapProps) {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_KEY,
  })

  const center = useMemo(() => {
    if (pickup && dropoff) return { lat: (pickup.lat + dropoff.lat) / 2, lng: (pickup.lng + dropoff.lng) / 2 }
    return pickup ?? dropoff ?? { lat: 40.7357, lng: -74.0327 }
  }, [pickup, dropoff])

  if (!import.meta.env.VITE_GOOGLE_MAPS_KEY) {
    return (
      <div className="rounded-card bg-gray-50 p-6">
        <StateMessage variant="empty" title="Map unavailable" description="Google Maps API key is not configured." />
      </div>
    )
  }

  if (!isLoaded) return <Skeleton className="h-[220px] w-full" />

  if (!pickup && !dropoff) {
    return (
      <div className="rounded-card bg-gray-50 p-6">
        <StateMessage variant="empty" title="No route data" description="This order has no pickup or drop-off coordinates." />
      </div>
    )
  }

  return (
    <div className="relative overflow-hidden rounded-card">
      {etaMinutes !== null && (
        <span className="absolute left-3 top-3 z-10 rounded-full bg-white px-3 py-1.5 text-xs font-bold text-primary shadow">
          Estimated Arrival: {etaMinutes} min
        </span>
      )}
      <GoogleMap mapContainerStyle={MAP_CONTAINER_STYLE} center={center} zoom={12}>
        {pickup && (
          <MarkerF
            position={pickup}
            title="Pickup"
            icon={{
              path: window.google.maps.SymbolPath.CIRCLE,
              scale: 7,
              fillColor: '#FE5035',
              fillOpacity: 1,
              strokeColor: '#FFFFFF',
              strokeWeight: 2,
            }}
          />
        )}
        {dropoff && (
          <MarkerF
            position={dropoff}
            title="Drop-off"
            icon={{
              path: window.google.maps.SymbolPath.CIRCLE,
              scale: 7,
              fillColor: '#26344F',
              fillOpacity: 1,
              strokeColor: '#FFFFFF',
              strokeWeight: 2,
            }}
          />
        )}
        {pickup && dropoff && (
          <PolylineF
            path={[pickup, dropoff]}
            options={{ strokeColor: '#26344F', strokeOpacity: 0.6, strokeWeight: 3 }}
          />
        )}
      </GoogleMap>
    </div>
  )
}
