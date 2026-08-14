-- Migration: Add reference_id column to vendor_requests and update notification triggers
-- Description:
-- Adds reference_id text column to vendor_requests table to track client-generated application IDs (e.g. EA-XXXXXX-XXXX).
-- Updates notification trigger to include reference_id in notification metadata and title/message.

-- 1. Add reference_id column
ALTER TABLE vendor_requests
  ADD COLUMN IF NOT EXISTS reference_id TEXT;

-- Create index on reference_id for quick lookups
CREATE INDEX IF NOT EXISTS idx_vendor_requests_reference_id ON vendor_requests(reference_id);

-- 2. Update Notification Trigger to include reference_id
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
  ref_text TEXT;
BEGIN
  -- Look up exhibition name
  SELECT name INTO exh_name FROM exhibitions WHERE id = NEW.exhibition_id;
  IF exh_name IS NULL THEN
    exh_name := 'Upcoming Exhibition';
  END IF;

  num_stalls := COALESCE(NEW.stalls_wanted, 1);
  ref_text := COALESCE(NEW.reference_id, CONCAT('REQ-', NEW.id::text));

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
      CONCAT(NEW.business_name, ' (', ref_text, ') applied for ', num_stalls, ' stall(s) at ', exh_name, '.'),
      jsonb_build_object(
        'request_id', NEW.id,
        'reference_id', ref_text,
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
