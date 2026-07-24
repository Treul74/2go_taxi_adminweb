import { insforge } from './insforge'
import { normalizeLibraryValue, resolveLibraryValue } from './library'
import type { ServiceAreaInput, ServiceAreaRow, ServiceAreaStatus } from '../types/serviceAreas'

function assertNoError(error: { message: string } | null, fallback: string) {
  if (error) throw new Error(error.message || fallback)
}

const COLUMNS = 'id, name, province, district, area_code, status, vehicle_type_ids, created_at, updated_at'

interface RawServiceArea {
  id: string
  name: string
  province: string
  district: string
  area_code: string | null
  status: ServiceAreaStatus
  vehicle_type_ids: string[] | null
  created_at: string
  updated_at: string
}

function mapRow(row: RawServiceArea): ServiceAreaRow {
  return {
    id: row.id,
    name: row.name,
    province: row.province,
    district: row.district,
    areaCode: row.area_code,
    status: row.status,
    vehicleTypeIds: row.vehicle_type_ids ?? [],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export async function fetchServiceAreas(): Promise<ServiceAreaRow[]> {
  const { data, error } = await insforge.database
    .from('service_areas')
    .select(COLUMNS)
    .order('created_at', { ascending: false })

  assertNoError(error, 'Unable to load service areas.')
  return (data ?? []).map((row) => mapRow(row as RawServiceArea))
}

/**
 * Resolves province/district free text against the library table (reusing an
 * existing row or inserting a new one) and returns their canonical
 * title-cased form to persist on the service area.
 */
async function resolveProvinceDistrict(province: string, district: string): Promise<{ province: string; district: string }> {
  const resolvedProvince = await resolveLibraryValue('province', province)
  const resolvedDistrict = await resolveLibraryValue('district', district, normalizeLibraryValue(resolvedProvince))
  return { province: resolvedProvince, district: resolvedDistrict }
}

export async function createServiceArea(input: ServiceAreaInput): Promise<ServiceAreaRow> {
  const { province, district } = await resolveProvinceDistrict(input.province, input.district)

  const { data, error } = await insforge.database
    .from('service_areas')
    .insert([
      {
        name: input.name,
        province,
        district,
        status: input.status,
        vehicle_type_ids: input.vehicleTypeIds,
        polygon_coordinates: [],
      },
    ])
    .select(COLUMNS)
    .single()

  assertNoError(error, 'Unable to create service area.')
  return mapRow(data as RawServiceArea)
}

export async function updateServiceArea(id: string, input: ServiceAreaInput): Promise<ServiceAreaRow> {
  const { province, district } = await resolveProvinceDistrict(input.province, input.district)

  const { data, error } = await insforge.database
    .from('service_areas')
    .update({
      name: input.name,
      province,
      district,
      status: input.status,
      vehicle_type_ids: input.vehicleTypeIds,
    })
    .eq('id', id)
    .select(COLUMNS)
    .single()

  assertNoError(error, 'Unable to update service area.')
  return mapRow(data as RawServiceArea)
}

export async function setServiceAreaStatus(id: string, status: ServiceAreaStatus): Promise<void> {
  const { error } = await insforge.database.from('service_areas').update({ status }).eq('id', id)
  assertNoError(error, 'Unable to update service area status.')
}
