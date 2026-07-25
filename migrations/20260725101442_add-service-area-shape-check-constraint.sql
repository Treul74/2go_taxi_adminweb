-- polygon_coordinates was unconditionally NOT NULL, which effectively
-- required it even for area_type='radius' rows. Relax it to nullable and
-- enforce the actual per-shape requirement via a CHECK: polygon_coordinates
-- required when area_type='polygon'; radius_meters + center_lat + center_lng
-- required when area_type='radius'. Doesn't forbid also setting center_lat/
-- center_lng on a 'polygon' row (they're described as general map-navigation
-- coordinates, not radius-exclusive).
ALTER TABLE service_areas ALTER COLUMN polygon_coordinates DROP NOT NULL;

ALTER TABLE service_areas
  ADD CONSTRAINT service_areas_area_shape_check CHECK (
    (area_type != 'polygon' OR polygon_coordinates IS NOT NULL)
    AND
    (area_type != 'radius' OR (radius_meters IS NOT NULL AND center_lat IS NOT NULL AND center_lng IS NOT NULL))
  );
