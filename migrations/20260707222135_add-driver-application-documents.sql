-- Driver application documents submitted during onboarding.
-- Stored as URLs (uploaded by the driver app); nullable because existing
-- rows predate document collection.
ALTER TABLE drivers
  ADD COLUMN IF NOT EXISTS drivers_license_url TEXT,
  ADD COLUMN IF NOT EXISTS vehicle_registration_url TEXT,
  ADD COLUMN IF NOT EXISTS insurance_certificate_url TEXT;
