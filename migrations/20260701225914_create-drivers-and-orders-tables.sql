-- Helper: is the current session a registered admin?
-- SECURITY DEFINER so it can read the RLS-enabled `admins` table without
-- re-entering RLS on itself (see access-control guidance).
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admins
    WHERE auth_id = auth.uid()
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp;

-- =========================================================================
-- Drivers
-- =========================================================================
CREATE TABLE drivers (
  id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_id                UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name             TEXT NOT NULL,
  last_name              TEXT NOT NULL,
  email                  TEXT NOT NULL UNIQUE,
  phone_number           TEXT NOT NULL,
  profile_photo_url      TEXT,

  account_status         TEXT NOT NULL DEFAULT 'pending'
                          CHECK (account_status IN ('pending', 'approved', 'rejected', 'suspended')),
  driver_status          TEXT NOT NULL DEFAULT 'offline'
                          CHECK (driver_status IN ('active', 'idle', 'offline')),

  vehicle_make           TEXT,
  vehicle_model          TEXT,
  vehicle_year           INTEGER,
  vehicle_class          TEXT NOT NULL DEFAULT 'economy'
                          CHECK (vehicle_class IN ('economy', 'suv', 'luxury', 'sprinter')),
  license_plate          TEXT,

  rating                 NUMERIC(2,1) NOT NULL DEFAULT 0,
  total_ratings          INTEGER NOT NULL DEFAULT 0,
  total_completed_rides  INTEGER NOT NULL DEFAULT 0,
  total_cancelled_rides  INTEGER NOT NULL DEFAULT 0,
  total_earnings         NUMERIC(12,2) NOT NULL DEFAULT 0,

  current_lat            DOUBLE PRECISION,
  current_lng            DOUBLE PRECISION,
  location_updated_at    TIMESTAMP WITH TIME ZONE,

  created_at             TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at             TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TRIGGER update_drivers_updated_at
  BEFORE UPDATE ON drivers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX idx_drivers_account_status ON drivers(account_status);
CREATE INDEX idx_drivers_driver_status ON drivers(driver_status);
CREATE INDEX idx_drivers_created_at ON drivers(created_at DESC);

ALTER TABLE drivers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admins_manage_drivers" ON drivers
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON drivers TO authenticated;

-- =========================================================================
-- Orders
-- =========================================================================
CREATE TABLE orders (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id      UUID REFERENCES customers(id) ON DELETE SET NULL,
  driver_id        UUID REFERENCES drivers(id) ON DELETE SET NULL,

  status           TEXT NOT NULL DEFAULT 'pending'
                   CHECK (status IN ('pending', 'accepted', 'in_progress', 'completed', 'cancelled')),

  pickup_address   TEXT,
  pickup_lat       DOUBLE PRECISION,
  pickup_lng       DOUBLE PRECISION,
  dropoff_address  TEXT,
  dropoff_lat      DOUBLE PRECISION,
  dropoff_lng      DOUBLE PRECISION,

  fare_amount      NUMERIC(10,2) NOT NULL DEFAULT 0,
  payment_method   TEXT,

  requested_at     TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at     TIMESTAMP WITH TIME ZONE,

  created_at       TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at       TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_completed_at ON orders(completed_at DESC);
CREATE INDEX idx_orders_driver_id ON orders(driver_id);
CREATE INDEX idx_orders_customer_id ON orders(customer_id);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admins_manage_orders" ON orders
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON orders TO authenticated;
