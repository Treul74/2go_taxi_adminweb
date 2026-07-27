export type LibraryCategory = 'province' | 'district' | 'vehicle_make' | 'vehicle_model' | 'manager_role'

export interface LibraryEntry {
  id: string
  category: LibraryCategory
  value: string
  normalizedValue: string
  parentValue: string | null
}
