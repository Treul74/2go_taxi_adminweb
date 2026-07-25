export type LibraryCategory = 'province' | 'district' | 'vehicle_make' | 'vehicle_model'

export interface LibraryEntry {
  id: string
  category: LibraryCategory
  value: string
  normalizedValue: string
  parentValue: string | null
}
