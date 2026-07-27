-- Managers screen is backed by the existing admins table rather than a
-- separate managers table: a role assignment marks which admins have
-- oversight (see is_manager()) to view/approve/manage the rest.
ALTER TABLE admins ADD COLUMN role TEXT;
ALTER TABLE admins ADD COLUMN last_login_at TIMESTAMPTZ;
ALTER TABLE admins ALTER COLUMN phone DROP NOT NULL;

CREATE OR REPLACE FUNCTION is_manager(uid UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM admins
    WHERE auth_id = uid
      AND account_status = 'approved'
      AND role IS NOT NULL
  );
$$;

CREATE POLICY "managers_select_all_admins" ON admins
  FOR SELECT
  TO authenticated
  USING (is_manager(auth.uid()));

CREATE POLICY "managers_update_all_admins" ON admins
  FOR UPDATE
  TO authenticated
  USING (is_manager(auth.uid()))
  WITH CHECK (is_manager(auth.uid()));

CREATE POLICY "managers_insert_admins" ON admins
  FOR INSERT
  TO authenticated
  WITH CHECK (is_manager(auth.uid()));

INSERT INTO library (category, value, normalized_value, parent_value)
VALUES
  ('manager_role', 'Fleet Manager', 'fleet manager', NULL),
  ('manager_role', 'Regional Supervisor', 'regional supervisor', NULL),
  ('manager_role', 'Support Head', 'support head', NULL),
  ('manager_role', 'Logistics Lead', 'logistics lead', NULL)
ON CONFLICT DO NOTHING;

-- Bootstrap the first manager so the Managers screen has an initial user
-- who can view and approve the rest (chosen by the project owner).
UPDATE admins
SET account_status = 'approved', role = 'Fleet Manager'
WHERE email = 'stephensmarthome74@gmail.com';
