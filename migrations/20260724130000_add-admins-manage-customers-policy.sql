-- Admins currently have no RLS policy on customers (only self-access policies
-- for the customer app and driver-assigned-order visibility). The Customers
-- Management admin screen needs to list/search/update every customer, so add
-- the same admins_manage_* pattern already used on drivers/orders/vehicle_classes.
CREATE POLICY "admins_manage_customers" ON customers
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());
