import { insforge } from './insforge'

function assertNoError(error: { message: string } | null, fallback: string) {
  if (error) throw new Error(error.message || fallback)
}

const SUGGESTION_LIMIT = 8

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

/**
 * Autocomplete lookup: `parentValue` scopes to a category='district' row's
 * province (its normalized_value), matching the library table's parent_value
 * convention. Omit it to search unscoped (e.g. category='province').
 */
export async function searchLibraryValues(category: string, query: string, parentValue?: string): Promise<string[]> {
  const normalized = normalizeLibraryValue(query)
  const base = insforge.database.from('library').select('value').eq('category', category)
  const scoped = parentValue === undefined ? base : base.eq('parent_value', parentValue)
  const filtered = normalized ? scoped.like('normalized_value', `%${normalized}%`) : scoped

  const { data, error } = await filtered.order('value', { ascending: true }).limit(SUGGESTION_LIMIT)
  assertNoError(error, `Unable to search ${category} values.`)

  const values = ((data ?? []) as { value: string }[]).map((row) => row.value)
  return Array.from(new Set(values))
}

async function findExistingLibraryValue(category: string, normalized: string, parentValue: string | null): Promise<string | null> {
  const base = insforge.database.from('library').select('value').eq('category', category).eq('normalized_value', normalized)
  const query = parentValue === null ? base.is('parent_value', null) : base.eq('parent_value', parentValue)

  const { data, error } = await query.limit(1)
  assertNoError(error, 'Unable to check existing library values.')
  return (data?.[0] as { value: string } | undefined)?.value ?? null
}

/**
 * Resolves free text to a canonical library value: reuses an existing
 * category+normalized_value(+parent_value) row if one exists, otherwise
 * inserts a new title-cased row. Returns the exact value to persist/display.
 */
export async function resolveLibraryValue(category: string, rawValue: string, parentValue: string | null = null): Promise<string> {
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
    // Unique constraint race: another request inserted the same row between
    // our check and this insert. Reuse it instead of surfacing an error.
    const retryValue = await findExistingLibraryValue(category, normalized, parentValue)
    if (retryValue) return retryValue
    throw new Error(error.message || `Unable to save ${category}.`)
  }

  return (data as { value: string } | null)?.value ?? titleCased
}
