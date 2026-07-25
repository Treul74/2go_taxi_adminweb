const EARTH_RADIUS_KM = 6371
const ASSUMED_AVERAGE_SPEED_KMH = 30

export interface LatLng {
  lat: number
  lng: number
}

/** Simple average of a polygon's vertices — good enough for map-centering, not a true geometric centroid. */
export function polygonCenter(points: LatLng[]): LatLng | null {
  if (points.length === 0) return null
  const sum = points.reduce((acc, p) => ({ lat: acc.lat + p.lat, lng: acc.lng + p.lng }), { lat: 0, lng: 0 })
  return { lat: sum.lat / points.length, lng: sum.lng / points.length }
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

/** Planar (lat/lng-as-x/y) distance from a point to a segment — adequate for comparing nearby polygon edges, not geodesically exact. */
function distanceToSegment(p: LatLng, a: LatLng, b: LatLng): number {
  const dx = b.lng - a.lng
  const dy = b.lat - a.lat
  const lengthSq = dx * dx + dy * dy
  if (lengthSq === 0) return distanceKm(p, a)

  const t = Math.max(0, Math.min(1, ((p.lng - a.lng) * dx + (p.lat - a.lat) * dy) / lengthSq))
  const projection = { lat: a.lat + t * dy, lng: a.lng + t * dx }
  return distanceKm(p, projection)
}

/** Index at which to insert `point` into a closed polygon `ring` so it lands on its nearest edge. */
export function nearestEdgeInsertIndex(point: LatLng, ring: LatLng[]): number {
  let bestIndex = ring.length
  let bestDistance = Infinity

  for (let i = 0; i < ring.length; i++) {
    const a = ring[i]
    const b = ring[(i + 1) % ring.length]
    const distance = distanceToSegment(point, a, b)
    if (distance < bestDistance) {
      bestDistance = distance
      bestIndex = i + 1
    }
  }

  return bestIndex
}
