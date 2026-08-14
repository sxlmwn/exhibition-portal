-- Migration: Public vendor requests RLS, schema enhancements, and notification triggers
-- Description:
-- 1. Adds rich fields (vendor_name, email, notes, preferred_stall_code, stall_tier_preference, created_at) to vendor_requests
-- 2. Enables RLS on exhibitions and vendor_requests with anonymous policies (public read on exhibitions, public insert on vendor_requests)
-- 3. Adds automatic PostgreSQL trigger on vendor_requests to create notifications for all staff/owners on new submission

-- 1. Schema Enhancements on vendor_requests
ALTER TABLE vendor_requests
  ADD COLUMN IF NOT EXISTS vendor_name TEXT,
  ADD COLUMN IF NOT EXISTS email TEXT,
  ADD COLUMN IF NOT EXISTS notes TEXT,
  ADD COLUMN IF NOT EXISTS preferred_stall_code TEXT,
  ADD COLUMN IF NOT EXISTS stall_tier_preference TEXT,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 2. RLS on exhibitions (Allow public/anon read access for upcoming calendar)
ALTER TABLE exhibitions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read access on exhibitions" ON exhibitions;
CREATE POLICY "Allow public read access on exhibitions"
ON exhibitions FOR SELECT
TO anon, authenticated
USING (true);

-- 3. RLS on vendor_requests (Allow public/anon INSERT only; block anon SELECT/UPDATE/DELETE)
ALTER TABLE vendor_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow anonymous insert on vendor_requests" ON vendor_requests;
CREATE POLICY "Allow anonymous insert on vendor_requests"
ON vendor_requests FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Ensure authenticated staff/owners retain full access on vendor_requests
DROP POLICY IF EXISTS "Allow authenticated full access on vendor_requests" ON vendor_requests;
CREATE POLICY "Allow authenticated full access on vendor_requests"
ON vendor_requests FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- 4. Notification Trigger on vendor_requests
-- Automatically generates notification rows in notifications table for all staff/owners on new booking request
CREATE OR REPLACE FUNCTION notify_on_vendor_request()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  staff_rec RECORD;
  exh_name TEXT;
  num_stalls INT;
BEGIN
  -- Look up exhibition name
  SELECT name INTO exh_name FROM exhibitions WHERE id = NEW.exhibition_id;
  IF exh_name IS NULL THEN
    exh_name := 'Upcoming Exhibition';
  END IF;

  num_stalls := COALESCE(NEW.stalls_wanted, 1);

  -- Insert a notification for every staff user with an auth_id
  FOR staff_rec IN SELECT auth_id FROM staff_users WHERE auth_id IS NOT NULL LOOP
    INSERT INTO notifications (
      user_id,
      type,
      title,
      message,
      metadata,
      is_read,
      created_at,
      updated_at
    )
    VALUES (
      staff_rec.auth_id,
      'stall_request',
      'New Stall Request',
      CONCAT(NEW.business_name, ' applied for ', num_stalls, ' stall(s) at ', exh_name, '.'),
      jsonb_build_object(
        'request_id', NEW.id,
        'business_name', NEW.business_name,
        'vendor_name', COALESCE(NEW.vendor_name, NEW.business_name),
        'contact_number', NEW.contact_number,
        'email', NEW.email,
        'exhibition_id', NEW.exhibition_id,
        'exhibition_name', exh_name,
        'stalls_wanted', num_stalls,
        'budget_range', NEW.budget_range,
        'category', NEW.category,
        'preferred_stall_code', NEW.preferred_stall_code,
        'notes', NEW.notes
      ),
      FALSE,
      NOW(),
      NOW()
    );
  END LOOP;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_notify_on_vendor_request ON vendor_requests;
CREATE TRIGGER trigger_notify_on_vendor_request
AFTER INSERT ON vendor_requests
FOR EACH ROW
EXECUTE FUNCTION notify_on_vendor_request();
