import { insforge } from './insforge'
import type { LibraryCategory, LibraryEntry } from '../types/library'

function assertNoError(error: { message: string } | null, fallback: string) {
  if (error) throw new Error(error.message || fallback)
}

const COLUMNS = 'id, category, value, normalized_value, parent_value'

interface RawLibraryEntry {
  id: string
  category: LibraryCategory
  value: string
  normalized_value: string
  parent_value: string | null
}

function mapRow(row: RawLibraryEntry): LibraryEntry {
  return {
    id: row.id,
    category: row.category,
    value: row.value,
    normalizedValue: row.normalized_value,
    parentValue: row.parent_value,
  }
}

export function normalizeLibraryValue(text: string): string {
  return text.toLowerCase().trim().replace(/\s+/g, ' ')
}

export function titleCaseLibraryValue(text: string): string {
  return text
    .trim()
    .replace(/\s+/g, ' ')
    .split(' ')
    .map((word) => (word ? word[0].toUpperCase() + word.slice(1).toLowerCase() : word))
    .join(' ')
}

type LibraryQuery = ReturnType<ReturnType<typeof insforge.database.from>['select']>

function scopeByParent(query: LibraryQuery, parentValue: string | null): LibraryQuery {
  return parentValue === null ? query.is('parent_value', null) : query.eq('parent_value', parentValue)
}

const SUGGESTION_LIMIT = 8

/**
 * Autocomplete lookup: `parentValue` scopes to a category='district' row's
 * province (its normalized_value), matching the library table's parent_value
 * convention. Omit it to search unscoped (e.g. category='province').
 */
export async function searchLibraryValues(category: LibraryCategory, query: string, parentValue?: string): Promise<string[]> {
  const normalized = normalizeLibraryValue(query)
  let q = insforge.database.from('library').select('value').eq('category', category) as LibraryQuery
  if (parentValue !== undefined) q = q.eq('parent_value', parentValue)
  if (normalized) q = q.like('normalized_value', `%${normalized}%`)

  const { data, error } = await q.order('value', { ascending: true }).limit(SUGGESTION_LIMIT)
  assertNoError(error, `Unable to search ${category} values.`)

  return Array.from(new Set(((data ?? []) as { value: string }[]).map((row) => row.value)))
}

async function findExistingLibraryValue(category: LibraryCategory, normalized: string, parentValue: string | null): Promise<string | null> {
  const query = scopeByParent(
    insforge.database.from('library').select('value').eq('category', category).eq('normalized_value', normalized) as LibraryQuery,
    parentValue,
  )
  const { data, error } = await query.limit(1)
  assertNoError(error, 'Unable to check existing library values.')
  return (data?.[0] as { value: string } | undefined)?.value ?? null
}

/**
 * Resolves free text to a canonical library value: reuses an existing
 * category+normalized_value(+parent_value) row if one exists, otherwise
 * inserts a new title-cased row. Returns the exact value to persist/display.
 */
export async function resolveLibraryValue(category: LibraryCategory, rawValue: string, parentValue: string | null = null): Promise<string> {
  const normalized = normalizeLibraryValue(rawValue)
  if (!normalized) throw new Error('Value is required.')
  const titleCased = titleCaseLibraryValue(rawValue)

  const existingValue = await findExistingLibraryValue(category, normalized, parentValue)
  if (existingValue) return existingValue

  const { data, error } = await insforge.database
    .from('library')
    .insert([{ category, value: titleCased, normalized_value: normalized, parent_value: parentValue }])
    .select('value')
    .single()

  if (error) {
    // Unique constraint race: another request inserted the same row between our check and this insert.
    const retryValue = await findExistingLibraryValue(category, normalized, parentValue)
    if (retryValue) return retryValue
    throw new Error(error.message || `Unable to save ${category}.`)
  }

  return (data as { value: string } | null)?.value ?? titleCased
}

export async function fetchLibraryByCategory(category: LibraryCategory): Promise<LibraryEntry[]> {
  const { data, error } = await insforge.database
    .from('library')
    .select(COLUMNS)
    .eq('category', category)
    .order('value', { ascending: true })

  assertNoError(error, `Unable to load ${category} entries.`)
  return (data ?? []).map((row) => mapRow(row as RawLibraryEntry))
}

interface CreateLibraryEntryInput {
  category: LibraryCategory
  value: string
  parentValue?: string | null
}

export async function createLibraryEntry({ category, value, parentValue = null }: CreateLibraryEntryInput): Promise<LibraryEntry> {
  const normalizedValue = normalizeLibraryValue(value)
  if (!normalizedValue) throw new Error('A value is required.')
  const titleCased = titleCaseLibraryValue(value)

  const existingQuery = scopeByParent(
    insforge.database.from('library').select('id').eq('category', category).eq('normalized_value', normalizedValue) as LibraryQuery,
    parentValue,
  )
  const { data: existing, error: existingError } = await existingQuery
  assertNoError(existingError, 'Unable to check for duplicates.')
  if (existing && existing.length > 0) throw new Error(`"${titleCased}" already exists.`)

  const { data, error } = await insforge.database
    .from('library')
    .insert([{ category, value: titleCased, normalized_value: normalizedValue, parent_value: parentValue }])
    .select(COLUMNS)
    .single()

  if (error) {
    // Unique constraint race: another request inserted the same row between our check and this insert.
    throw new Error(error.message.includes('duplicate') ? `"${titleCased}" already exists.` : error.message || 'Unable to create entry.')
  }

  return mapRow(data as RawLibraryEntry)
}

export async function deleteLibraryEntry(entry: LibraryEntry): Promise<void> {
  if (entry.category === 'vehicle_make') {
    const { count, error: countError } = await insforge.database
      .from('library')
      .select('id', { count: 'exact', head: true })
      .eq('category', 'vehicle_model')
      .eq('parent_value', entry.normalizedValue)

    assertNoError(countError, 'Unable to check for models under this make.')
    if ((count ?? 0) > 0) throw new Error('Remove all models under this make before deleting it.')
  }

  const { error } = await insforge.database.from('library').delete().eq('id', entry.id)
  assertNoError(error, 'Unable to delete entry.')
}
