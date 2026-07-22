-- Enable RLS on the Booking table
ALTER TABLE "Booking" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Booking" FORCE ROW LEVEL SECURITY;

-- Define tenant isolation policy matching the database session parameter
DROP POLICY IF EXISTS booking_tenant_isolation ON "Booking";
CREATE POLICY booking_tenant_isolation ON "Booking"
  AS PERMISSIVE
  FOR ALL
  TO PUBLIC
  USING ("tenantId" = current_setting('app.current_tenant_id', true))
  WITH CHECK ("tenantId" = current_setting('app.current_tenant_id', true));
