-- Replaces the FK-normalized provinces/districts tables (20260724234504)
-- with a single reusable "library" table for reference/lookup values
-- (province/district AND vehicle_make/vehicle_model share the same
-- parent-child pattern), so future lookup categories don't each need
-- their own table + FK plumbing.
--
-- Statement order differs from the source spec: service_areas.district_id
-- must be backfilled into plain-text province/district and dropped BEFORE
-- districts/provinces can be dropped, since district_id still has a live FK
-- into districts(id).

-- 1. Add the plain-text columns and backfill from the FK hierarchy before
--    that hierarchy is torn down, so the existing "Zambezi Town" row keeps
--    its province/district instead of reverting to ''.
ALTER TABLE service_areas
  ADD COLUMN IF NOT EXISTS province TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS district TEXT NOT NULL DEFAULT '';

UPDATE service_areas sa
SET province = p.name, district = d.name
FROM districts d
JOIN provinces p ON p.id = d.province_id
WHERE d.id = sa.district_id;

-- 2. Drop the FK column, then the now-unreferenced hierarchy tables.
ALTER TABLE service_areas DROP COLUMN IF EXISTS district_id;

DROP TABLE IF EXISTS districts;
DROP TABLE IF EXISTS provinces;

-- 3. The reusable library table.
CREATE TABLE IF NOT EXISTS library (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category          TEXT NOT NULL,
  value             TEXT NOT NULL,
  normalized_value  TEXT NOT NULL,
  parent_value      TEXT,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(category, normalized_value, parent_value)
);

CREATE INDEX IF NOT EXISTS idx_library_category ON library(category);
CREATE INDEX IF NOT EXISTS idx_library_category_parent ON library(category, parent_value);

ALTER TABLE library ENABLE ROW LEVEL SECURITY;

-- Every signed-in caller (admin panel, driver app, customer app) can read
-- the library — driver vehicle registration needs to list makes/models,
-- and the Service Areas screen needs to list provinces/districts.
CREATE POLICY "authenticated_read_library" ON library
  FOR SELECT
  TO authenticated
  USING (true);

-- Only the admin panel can write library rows. Province/district rows get
-- created ad hoc from the admin-side New Service Area form's autocomplete;
-- vehicle_make/vehicle_model rows are only ever written by the admin panel's
-- (future) make/model management screen. Both paths are admin panel code,
-- so a single is_admin() gate covers both — there is no separate write path
-- for non-admin authenticated users (drivers/customers) for any category.
CREATE POLICY "admins_manage_library" ON library
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

GRANT SELECT, INSERT, UPDATE, DELETE ON library TO authenticated;

-- 4. Seed vehicle makes/models. Starting data only — the admin panel is the
-- only place new rows get added going forward.
INSERT INTO library (category, value, normalized_value, parent_value)
VALUES
  ('vehicle_make', 'Toyota', 'toyota', NULL),
  ('vehicle_make', 'Nissan', 'nissan', NULL),
  ('vehicle_make', 'Mazda', 'mazda', NULL),
  ('vehicle_make', 'BMW', 'bmw', NULL),
  ('vehicle_model', 'Corolla', 'corolla', 'toyota'),
  ('vehicle_model', 'Rolla', 'rolla', 'toyota'),
  ('vehicle_model', 'Delta', 'delta', 'nissan'),
  ('vehicle_model', 'Special', 'special', 'mazda')
ON CONFLICT DO NOTHING;

-- 5. service_areas: center-point/radius support alongside the existing
-- polygon shape, plus confirm/create area_code and vehicle_type_ids.
ALTER TABLE service_areas
  ADD COLUMN IF NOT EXISTS center_lat DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS center_lng DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS area_type TEXT NOT NULL DEFAULT 'polygon'
    CHECK (area_type IN ('polygon', 'radius')),
  ADD COLUMN IF NOT EXISTS radius_meters DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS area_code TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS vehicle_type_ids UUID[] DEFAULT '{}';
