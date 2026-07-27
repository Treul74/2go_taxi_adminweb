-- Let any signed-in admin touch their own last_login_at (for the Managers
-- screen's "Currently Online" stat) without opening a path to self-approve
-- or self-assign a manager role. RLS alone can't compare OLD/NEW values, so
-- the field mask is enforced by a trigger per access-control guidance.
CREATE POLICY "admins_update_self" ON admins
  FOR UPDATE
  TO authenticated
  USING (auth_id = auth.uid())
  WITH CHECK (auth_id = auth.uid());

CREATE OR REPLACE FUNCTION guard_admins_self_update()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF is_manager(auth.uid()) THEN
    RETURN NEW;
  END IF;

  IF NEW.full_name IS DISTINCT FROM OLD.full_name
    OR NEW.email IS DISTINCT FROM OLD.email
    OR NEW.role IS DISTINCT FROM OLD.role
    OR NEW.province IS DISTINCT FROM OLD.province
    OR NEW.district IS DISTINCT FROM OLD.district
    OR NEW.account_status IS DISTINCT FROM OLD.account_status
  THEN
    RAISE EXCEPTION 'Only a manager can change this field.';
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER guard_admins_self_update
  BEFORE UPDATE ON admins
  FOR EACH ROW EXECUTE FUNCTION guard_admins_self_update();
