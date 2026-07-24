import { DirectionsRenderer, GoogleMap, MarkerF, PolylineF, useJsApiLoader } from '@react-google-maps/api'
import { useEffect, useMemo, useState } from 'react'
import Skeleton from '../../../components/ui/Skeleton'
import StateMessage from '../../../components/ui/StateMessage'

interface LatLng {
  lat: number
  lng: number
}

interface RouteMapProps {
  pickup: LatLng | null
  dropoff: LatLng | null
  distanceMiles: number | null
}

const MAP_CONTAINER_STYLE = { width: '100%', height: '220px', borderRadius: '8px' }

export default function RouteMap({ pickup, dropoff, distanceMiles }: RouteMapProps) {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_KEY,
  })
  const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null)

  useEffect(() => {
    // Clearing stale directions before kicking off the new route fetch is the standard
    // fetch-on-deps-change pattern (react.dev/learn/you-might-not-need-an-effect#fetching-data-with-effects).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDirections(null)
    if (!isLoaded || !pickup || !dropoff) return

    const directionsService = new google.maps.DirectionsService()
    directionsService.route(
      { origin: pickup, destination: dropoff, travelMode: google.maps.TravelMode.DRIVING },
      (result, status) => {
        if (status === google.maps.DirectionsStatus.OK && result) setDirections(result)
      },
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded, pickup?.lat, pickup?.lng, dropoff?.lat, dropoff?.lng])

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
      {distanceMiles != null && (
        <span className="absolute right-3 top-3 z-10 rounded-full bg-success/10 px-3 py-1.5 text-xs font-bold text-success shadow">
          {distanceMiles.toFixed(1)} Miles
        </span>
      )}
      <GoogleMap mapContainerStyle={MAP_CONTAINER_STYLE} center={center} zoom={12}>
        {directions ? (
          <DirectionsRenderer
            directions={directions}
            options={{
              suppressMarkers: true,
              polylineOptions: { strokeColor: '#FE5035', strokeOpacity: 0.8, strokeWeight: 4 },
            }}
          />
        ) : (
          pickup &&
          dropoff && (
            <PolylineF path={[pickup, dropoff]} options={{ strokeColor: '#FE5035', strokeOpacity: 0.6, strokeWeight: 3 }} />
          )
        )}
        {pickup && (
          <MarkerF
            position={pickup}
            title="Pickup"
            icon={{
              path: window.google.maps.SymbolPath.CIRCLE,
              scale: 7,
              fillColor: '#00A67D',
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
              fillColor: '#FE5035',
              fillOpacity: 1,
              strokeColor: '#FFFFFF',
              strokeWeight: 2,
            }}
          />
        )}
      </GoogleMap>
    </div>
  )
}
