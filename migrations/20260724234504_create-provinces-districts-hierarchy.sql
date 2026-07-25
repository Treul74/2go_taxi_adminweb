-- Service Areas hierarchy: Province > District > Service Area.
-- Normalizes the plain-text province/district columns added on
-- service_areas (20260724183519) into proper FK-backed lookup tables.
CREATE TABLE provinces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE districts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  province_id UUID NOT NULL REFERENCES provinces(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(province_id, name)
);

CREATE INDEX idx_districts_province_id ON districts(province_id);

ALTER TABLE service_areas
  ADD COLUMN district_id UUID REFERENCES districts(id);

-- Backfill existing plain-text province/district values into the new tables.
INSERT INTO provinces (name)
  SELECT DISTINCT province FROM service_areas WHERE province <> ''
  ON CONFLICT (name) DO NOTHING;

INSERT INTO districts (province_id, name)
  SELECT DISTINCT p.id, sa.district
  FROM service_areas sa
  JOIN provinces p ON p.name = sa.province
  WHERE sa.district <> ''
  ON CONFLICT (province_id, name) DO NOTHING;

UPDATE service_areas sa
SET district_id = d.id
FROM districts d
JOIN provinces p ON p.id = d.province_id
WHERE d.name = sa.district AND p.name = sa.province;

ALTER TABLE service_areas
  ALTER COLUMN district_id SET NOT NULL,
  DROP COLUMN province,
  DROP COLUMN district;

CREATE INDEX idx_service_areas_district_id ON service_areas(district_id);

ALTER TABLE provinces ENABLE ROW LEVEL SECURITY;
ALTER TABLE districts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admins_manage_provinces" ON provinces
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "admins_manage_districts" ON districts
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

GRANT SELECT, INSERT, UPDATE, DELETE ON provinces TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON districts TO authenticated;
