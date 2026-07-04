CREATE TABLE admins (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_id        UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name      TEXT NOT NULL,
  email          TEXT NOT NULL UNIQUE,
  phone          TEXT NOT NULL,
  province       TEXT,
  district       TEXT,
  city           TEXT,
  description    TEXT,
  account_status TEXT NOT NULL DEFAULT 'pending'
                 CHECK (account_status IN ('pending', 'approved', 'rejected')),
  created_at     TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at     TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TRIGGER update_admins_updated_at
  BEFORE UPDATE ON admins
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admins_insert_self" ON admins
  FOR INSERT
  TO authenticated
  WITH CHECK (auth_id = auth.uid());

CREATE POLICY "admins_select_self" ON admins
  FOR SELECT
  TO authenticated
  USING (auth_id = auth.uid());
