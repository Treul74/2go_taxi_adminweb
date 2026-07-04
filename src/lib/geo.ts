const EARTH_RADIUS_KM = 6371
const ASSUMED_AVERAGE_SPEED_KMH = 30

interface LatLng {
  lat: number
  lng: number
}

export function distanceKm(a: LatLng, b: LatLng): number {
  const dLat = ((b.lat - a.lat) * Math.PI) / 180
  const dLng = ((b.lng - a.lng) * Math.PI) / 180
  const lat1 = (a.lat * Math.PI) / 180
  const lat2 = (b.lat * Math.PI) / 180

  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(h))
}

/** Rough estimate assuming a constant average city driving speed — not a routed ETA. */
export function estimateEtaMinutes(a: LatLng, b: LatLng): number {
  const km = distanceKm(a, b)
  return Math.max(1, Math.round((km / ASSUMED_AVERAGE_SPEED_KMH) * 60))
}
