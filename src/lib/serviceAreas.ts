import { polygonCenter } from './geo'
import { insforge } from './insforge'
import type {
  EstimatedDemand,
  LatLng,
  ServiceAreaHierarchy,
  ServiceAreaInput,
  ServiceAreaRow,
  ServiceAreaStatus,
  ServiceAreaType,
} from '../types/serviceAreas'

function assertNoError(error: { message: string } | null, fallback: string) {
  if (error) throw new Error(error.message || fallback)
}

const AREA_COLUMNS =
  'id, province, district, name, area_code, polygon_coordinates, area_type, center_lat, center_lng, radius_meters, status, estimated_demand, fleet_size, base_fare_multiplier, service_types, updated_at, created_at'

interface RawServiceArea {
  id: string
  province: string
  district: string
  name: string
  area_code: string | null
  polygon_coordinates: unknown
  area_type: ServiceAreaType
  center_lat: number | null
  center_lng: number | null
  radius_meters: number | null
  status: ServiceAreaStatus
  estimated_demand: EstimatedDemand | null
  fleet_size: number | null
  base_fare_multiplier: string | number | null
  service_types: string[] | null
  updated_at: string
  created_at: string
}

/** Reads either the current GeoJSON Polygon shape or a legacy/empty array. */
function parsePolygon(raw: unknown): LatLng[] {
  if (Array.isArray(raw)) return []

  const geo = raw as { type?: string; coordinates?: number[][][] } | null
  const ring = geo?.type === 'Polygon' ? geo.coordinates?.[0] : null
  if (!ring) return []

  return ring.slice(0, -1).map(([lng, lat]) => ({ lat, lng }))
}

export function polygonToGeoJson(points: LatLng[]) {
  const ring = points.map((p) => [p.lng, p.lat])
  if (ring.length > 0) ring.push(ring[0])
  return { type: 'Polygon', coordinates: [ring] }
}

function mapArea(row: RawServiceArea): ServiceAreaRow {
  return {
    id: row.id,
    province: row.province,
    district: row.district,
    name: row.name,
    areaCode: row.area_code,
    polygon: parsePolygon(row.polygon_coordinates),
    areaType: row.area_type,
    centerLat: row.center_lat,
    centerLng: row.center_lng,
    radiusMeters: row.radius_meters,
    status: row.status,
    estimatedDemand: row.estimated_demand,
    fleetSize: row.fleet_size ?? 0,
    baseFareMultiplier: Number(row.base_fare_multiplier ?? 1),
    serviceTypes: row.service_types ?? [],
    updatedAt: row.updated_at,
    createdAt: row.created_at,
  }
}

export async function fetchServiceAreaHierarchy(): Promise<ServiceAreaHierarchy> {
  const { data, error } = await insforge.database.from('service_areas').select(AREA_COLUMNS).order('name', { ascending: true })

  assertNoError(error, 'Unable to load service areas.')
  return { areas: (data ?? []).map((row) => mapArea(row as RawServiceArea)) }
}

export async function fetchActiveTripsCount(): Promise<number> {
  const { count, error } = await insforge.database
    .from('orders')
    .select('id', { count: 'exact', head: true })
    .in('status', ['accepted', 'in_progress'])

  assertNoError(error, 'Unable to load active trips.')
  return count ?? 0
}

export async function createServiceArea(input: ServiceAreaInput): Promise<ServiceAreaRow> {
  const { data, error } = await insforge.database
    .from('service_areas')
    .insert([
      {
        province: input.province,
        district: input.district,
        name: input.name,
        area_code: input.areaCode || null,
        polygon_coordinates: [],
        estimated_demand: input.estimatedDemand,
        fleet_size: input.fleetSize,
        base_fare_multiplier: input.baseFareMultiplier,
        service_types: input.serviceTypes,
      },
    ])
    .select(AREA_COLUMNS)
    .single()

  assertNoError(error, 'Unable to create service area.')
  return mapArea(data as RawServiceArea)
}

export async function updateServiceAreaStatus(id: string, status: ServiceAreaStatus): Promise<void> {
  const { error } = await insforge.database.from('service_areas').update({ status }).eq('id', id)
  assertNoError(error, 'Unable to update service area status.')
}

export async function updateServiceAreaPolygon(id: string, points: LatLng[]): Promise<void> {
  const center = polygonCenter(points)

  const { error } = await insforge.database
    .from('service_areas')
    .update({
      polygon_coordinates: polygonToGeoJson(points),
      center_lat: center?.lat ?? null,
      center_lng: center?.lng ?? null,
    })
    .eq('id', id)

  assertNoError(error, 'Unable to save the drawn polygon.')
}
