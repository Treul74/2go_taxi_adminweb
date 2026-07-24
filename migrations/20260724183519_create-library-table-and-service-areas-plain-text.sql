-- Replaces the (never-populated, empty-migration) provinces/districts tables
-- with a single reusable "library" table for reference/lookup values, so
-- future lookup categories don't each need their own table + FK plumbing.
DROP TABLE IF EXISTS districts;
DROP TABLE IF EXISTS provinces;

CREATE TABLE library (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category          TEXT NOT NULL,
  value             TEXT NOT NULL,
  normalized_value  TEXT NOT NULL,
  parent_value      TEXT,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(category, normalized_value, parent_value)
);

CREATE INDEX idx_library_category ON library(category);
CREATE INDEX idx_library_category_parent ON library(category, parent_value);

ALTER TABLE library ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admins_manage_library" ON library
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

GRANT SELECT, INSERT, UPDATE, DELETE ON library TO authenticated;

-- service_areas: plain-text province/district instead of a districts FK.
ALTER TABLE service_areas
  DROP COLUMN IF EXISTS district_id,
  ADD COLUMN IF NOT EXISTS province TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS district TEXT NOT NULL DEFAULT '';

-- area_code / vehicle_type_ids: confirm/create.
ALTER TABLE service_areas
  ADD COLUMN IF NOT EXISTS area_code TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS vehicle_type_ids UUID[] DEFAULT '{}';
