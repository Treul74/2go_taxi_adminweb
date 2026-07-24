-- Fare Configuration screen (Batch 3): extends the existing `fare_config`
-- table (created same-day by create-fare-config-table /
-- create-calculate-fare-function, ahead of this repo's local migration
-- history) rather than introducing a competing `pricing_rules` table.
-- `calculate_fare_breakdown()` already reads base_fare/per_km/per_minute/
-- per_minute_waiting/min_fare from this table by `vehicle_type` — that
-- formula and its input columns are untouched here. This migration only
-- links the row to vehicle_classes and adds columns with no prior
-- hardcoded equivalent, seeded at neutral defaults.

ALTER TABLE fare_config
  ADD COLUMN vehicle_class_id UUID REFERENCES vehicle_classes(id);

UPDATE fare_config fc
SET vehicle_class_id = vc.id
FROM vehicle_classes vc
WHERE lower(vc.name) = fc.vehicle_type;

ALTER TABLE fare_config
  ALTER COLUMN vehicle_class_id SET NOT NULL,
  ADD CONSTRAINT fare_config_vehicle_class_id_key UNIQUE (vehicle_class_id);

CREATE INDEX idx_fare_config_vehicle_class_id ON fare_config(vehicle_class_id);

-- New admin-only controls. Not present in calculate_fare_breakdown()'s
-- formula yet — seeded neutral (1.0x multipliers, 0 fees/commissions) so
-- existing fare output is unaffected until a future migration wires them
-- into the calculation.
ALTER TABLE fare_config
  ADD COLUMN night_rate_multiplier   NUMERIC(4,2) NOT NULL DEFAULT 1.0 CHECK (night_rate_multiplier > 0),
  ADD COLUMN peak_multiplier         NUMERIC(4,2) NOT NULL DEFAULT 1.0 CHECK (peak_multiplier > 0),
  ADD COLUMN cancellation_fee        NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (cancellation_fee >= 0),
  ADD COLUMN platform_commission_pct NUMERIC(5,2) NOT NULL DEFAULT 0 CHECK (platform_commission_pct BETWEEN 0 AND 100),
  ADD COLUMN driver_commission_pct   NUMERIC(5,2) NOT NULL DEFAULT 0 CHECK (driver_commission_pct BETWEEN 0 AND 100);

-- Admin write access. The existing "authenticated_can_read_fare_config"
-- SELECT policy is untouched (mobile/rider apps still read active rates);
-- this adds admin read/write on top of it.
CREATE POLICY "admins_manage_fare_config" ON fare_config
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

GRANT INSERT, UPDATE, DELETE ON fare_config TO authenticated;
