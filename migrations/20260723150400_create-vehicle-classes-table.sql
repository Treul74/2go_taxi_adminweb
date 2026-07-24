-- Vehicle Classes: admin-managed vehicle tier definitions (Batch 2).
-- Source of truth going forward for tier name/capacity/status/icon.
-- Intentionally NOT wired to drivers.vehicle_class yet — that FK swap is a
-- separate future migration. Seed values below match the vehicle-classes
-- screen mockup (Economy/Comfort/Bike/Tricycle/Truck), which is a different
-- vocabulary than drivers.vehicle_class's real CHECK values
-- ('economy','suv','luxury','sprinter'); reconcile the two when the FK
-- migration lands.
CREATE TABLE vehicle_classes (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name           TEXT NOT NULL UNIQUE,
  description    TEXT,
  icon_svg_url   TEXT,
  icon_svg_key   TEXT,
  max_capacity   INTEGER NOT NULL CHECK (max_capacity > 0),
  status         TEXT NOT NULL DEFAULT 'active'
                 CHECK (status IN ('active', 'inactive')),
  display_order  INTEGER NOT NULL DEFAULT 0,

  created_at     TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at     TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TRIGGER update_vehicle_classes_updated_at
  BEFORE UPDATE ON vehicle_classes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX idx_vehicle_classes_display_order ON vehicle_classes(display_order);
CREATE INDEX idx_vehicle_classes_status ON vehicle_classes(status);

ALTER TABLE vehicle_classes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admins_manage_vehicle_classes" ON vehicle_classes
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON vehicle_classes TO authenticated;

INSERT INTO vehicle_classes (name, description, max_capacity, status, display_order) VALUES
  ('Economy', 'Standard rides for daily commute.', 4, 'active', 1),
  ('Comfort', 'Newer vehicles with extra legroom.', 4, 'active', 2),
  ('Bike', 'Fast solo travel via motorcycles.', 1, 'active', 3),
  ('Tricycle', 'Affordable short-range transport.', 3, 'active', 4),
  ('Truck', 'Heavy-duty goods transport.', 2, 'active', 5);

-- =========================================================================
-- Storage: vehicle-class-icons bucket (public-read, admin-write)
-- =========================================================================
CREATE POLICY "vehicle_class_icons_public_select" ON storage.objects
  FOR SELECT
  TO authenticated, anon
  USING (bucket = 'vehicle-class-icons');

CREATE POLICY "vehicle_class_icons_admin_insert" ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket = 'vehicle-class-icons' AND public.is_admin());

CREATE POLICY "vehicle_class_icons_admin_update" ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (bucket = 'vehicle-class-icons' AND public.is_admin())
  WITH CHECK (bucket = 'vehicle-class-icons' AND public.is_admin());

CREATE POLICY "vehicle_class_icons_admin_delete" ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket = 'vehicle-class-icons' AND public.is_admin());

GRANT SELECT ON storage.objects TO anon;
GRANT USAGE ON SCHEMA storage TO anon;
