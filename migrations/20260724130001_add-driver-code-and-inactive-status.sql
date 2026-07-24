-- Drivers Management screen needs a human-readable driver ID and an
-- "inactive" account status (distinct from suspended/rejected) for drivers
-- who are approved but currently deactivated.

ALTER TABLE drivers DROP CONSTRAINT drivers_account_status_check;
ALTER TABLE drivers ADD CONSTRAINT drivers_account_status_check
  CHECK (account_status IN ('pending', 'approved', 'rejected', 'suspended', 'inactive'));

CREATE SEQUENCE IF NOT EXISTS driver_code_seq;

ALTER TABLE drivers ADD COLUMN IF NOT EXISTS driver_code TEXT;

WITH ordered AS (
  SELECT id, row_number() OVER (ORDER BY created_at, id) AS rn
  FROM drivers
  WHERE driver_code IS NULL
)
UPDATE drivers d SET driver_code = 'DRV-' || lpad(o.rn::text, 5, '0')
FROM ordered o
WHERE d.id = o.id;

SELECT setval(
  'driver_code_seq',
  GREATEST((SELECT count(*) FROM drivers), 1),
  (SELECT count(*) FROM drivers) > 0
);

ALTER TABLE drivers ALTER COLUMN driver_code SET DEFAULT ('DRV-' || lpad(nextval('driver_code_seq')::text, 5, '0'));
ALTER TABLE drivers ALTER COLUMN driver_code SET NOT NULL;
ALTER TABLE drivers ADD CONSTRAINT drivers_driver_code_key UNIQUE (driver_code);
