import type { LatLng } from './geo'

let geocoder: google.maps.Geocoder | null = null

function getGeocoder(): google.maps.Geocoder | null {
  if (typeof window === 'undefined' || !window.google?.maps) return null
  if (!geocoder) geocoder = new window.google.maps.Geocoder()
  return geocoder
}

/**
 * Resolves free text (e.g. "Zambezi, North Western, Zambia") to coordinates via the
 * Google Geocoding API. Returns null if the Maps JS API hasn't loaded yet or nothing matched —
 * callers should treat that as "no location available" rather than an error.
 */
export async function geocodeAddress(address: string): Promise<LatLng | null> {
  const client = getGeocoder()
  if (!client) return null

  try {
    const { results } = await client.geocode({ address })
    const location = results[0]?.geometry.location
    return location ? { lat: location.lat(), lng: location.lng() } : null
  } catch {
    return null
  }
}
