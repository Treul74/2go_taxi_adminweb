import { insforge } from './insforge'
import type { VehicleClassInput, VehicleClassRow, VehicleClassStats } from '../types/vehicleClasses'

function assertNoError(error: { message: string } | null, fallback: string) {
  if (error) throw new Error(error.message || fallback)
}

const COLUMNS = 'id, name, description, icon_svg_url, icon_svg_key, max_capacity, status, display_order, created_at, updated_at'

interface RawVehicleClass {
  id: string
  name: string
  description: string | null
  icon_svg_url: string | null
  icon_svg_key: string | null
  max_capacity: number
  status: 'active' | 'inactive'
  display_order: number
  created_at: string
  updated_at: string
}

function mapRow(row: RawVehicleClass): VehicleClassRow {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    iconSvgUrl: row.icon_svg_url,
    iconSvgKey: row.icon_svg_key,
    maxCapacity: row.max_capacity,
    status: row.status,
    displayOrder: row.display_order,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export async function fetchVehicleClasses(): Promise<VehicleClassRow[]> {
  const { data, error } = await insforge.database
    .from('vehicle_classes')
    .select(COLUMNS)
    .order('display_order', { ascending: true })

  assertNoError(error, 'Unable to load vehicle classes.')
  return (data ?? []).map((row) => mapRow(row as RawVehicleClass))
}

export async function fetchVehicleClassStats(): Promise<VehicleClassStats> {
  const now = new Date()
  const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

  const { data, error } = await insforge.database.from('vehicle_classes').select('status, max_capacity, created_at')
  assertNoError(error, 'Unable to load vehicle class stats.')

  const rows = (data ?? []) as { status: 'active' | 'inactive'; max_capacity: number; created_at: string }[]
  const totalClasses = rows.length
  const newThisMonth = rows.filter((row) => row.created_at >= startOfThisMonth).length
  const activeTiers = rows.filter((row) => row.status === 'active').length
  const utilizationPct = totalClasses === 0 ? 0 : (activeTiers / totalClasses) * 100
  const avgCapacity = totalClasses === 0 ? 0 : rows.reduce((sum, row) => sum + Number(row.max_capacity ?? 0), 0) / totalClasses

  return { totalClasses, newThisMonth, activeTiers, utilizationPct, avgCapacity }
}

export async function createVehicleClass(input: VehicleClassInput): Promise<VehicleClassRow> {
  const { data: existing } = await insforge.database.from('vehicle_classes').select('display_order').order('display_order', { ascending: false }).limit(1)
  const nextOrder = ((existing?.[0] as { display_order: number } | undefined)?.display_order ?? 0) + 1

  const { data, error } = await insforge.database
    .from('vehicle_classes')
    .insert([
      {
        name: input.name,
        max_capacity: input.maxCapacity,
        status: input.status,
        icon_svg_url: input.iconSvgUrl ?? null,
        icon_svg_key: input.iconSvgKey ?? null,
        display_order: nextOrder,
      },
    ])
    .select(COLUMNS)
    .single()

  assertNoError(error, 'Unable to create vehicle class.')
  return mapRow(data as RawVehicleClass)
}

export async function updateVehicleClass(id: string, input: VehicleClassInput): Promise<VehicleClassRow> {
  const { data, error } = await insforge.database
    .from('vehicle_classes')
    .update({
      name: input.name,
      max_capacity: input.maxCapacity,
      status: input.status,
      ...(input.iconSvgUrl !== undefined ? { icon_svg_url: input.iconSvgUrl } : {}),
      ...(input.iconSvgKey !== undefined ? { icon_svg_key: input.iconSvgKey } : {}),
    })
    .eq('id', id)
    .select(COLUMNS)
    .single()

  assertNoError(error, 'Unable to update vehicle class.')
  return mapRow(data as RawVehicleClass)
}

export async function setVehicleClassStatus(id: string, status: 'active' | 'inactive'): Promise<void> {
  const { error } = await insforge.database.from('vehicle_classes').update({ status }).eq('id', id)
  assertNoError(error, 'Unable to update vehicle class status.')
}

const ICON_BUCKET = 'vehicle-class-icons'
const MAX_ICON_BYTES = 50 * 1024

// Heuristic check for "stroke-based only" icons: reject any fill other than
// none/currentColor/transparent so uploaded icons stay recolorable line art
// instead of solid shapes baked with fixed fill colors.
export function assertStrokeBasedSvg(svgText: string) {
  const fillMatches = svgText.matchAll(/fill\s*=\s*["']([^"']+)["']/gi)
  for (const match of fillMatches) {
    const value = match[1].trim().toLowerCase()
    if (value !== 'none' && value !== 'currentcolor' && value !== 'transparent') {
      throw new Error('Icon must be stroke-based (no filled shapes).')
    }
  }
}

export async function uploadVehicleClassIcon(file: File): Promise<{ url: string; key: string }> {
  if (file.size > MAX_ICON_BYTES) {
    throw new Error('Icon must be 50KB or smaller.')
  }
  if (!file.type.includes('svg') && !file.name.toLowerCase().endsWith('.svg')) {
    throw new Error('Icon must be an SVG file.')
  }

  const svgText = await file.text()
  assertStrokeBasedSvg(svgText)

  const { data, error } = await insforge.storage.from(ICON_BUCKET).uploadAuto(file)
  assertNoError(error, 'Unable to upload icon.')
  if (!data) throw new Error('Unable to upload icon.')
  return { url: data.url, key: data.key }
}
