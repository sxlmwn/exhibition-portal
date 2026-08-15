-- Migration: Create referrals table and configure RLS policies
-- Description:
-- 1. Creates referrals table with foreign key to exhibitions
-- 2. Enables Row Level Security (RLS)
-- 3. Adds public/anonymous INSERT policy (matches vendor_requests security model)
-- 4. Adds authenticated full access policy for agency staff
-- 5. Adds notification trigger for staff when a new vendor referral is submitted

-- 1. Create referrals table
CREATE TABLE IF NOT EXISTS referrals (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  referrer_name TEXT,
  referrer_contact TEXT,
  referred_business_name TEXT,
  referred_contact TEXT,
  exhibition_id BIGINT REFERENCES exhibitions(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for exhibition lookups and ordering
CREATE INDEX IF NOT EXISTS idx_referrals_exhibition_id ON referrals(exhibition_id);
CREATE INDEX IF NOT EXISTS idx_referrals_created_at ON referrals(created_at DESC);

-- 2. Enable Row Level Security
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;

-- 3. Allow anonymous insert on referrals (Public lead submission)
DROP POLICY IF EXISTS "Allow anonymous insert on referrals" ON referrals;
CREATE POLICY "Allow anonymous insert on referrals"
ON referrals FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- 4. Allow authenticated full access on referrals (Admin & Staff management)
DROP POLICY IF EXISTS "Allow authenticated full access on referrals" ON referrals;
CREATE POLICY "Allow authenticated full access on referrals"
ON referrals FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- 5. Notification Trigger for Staff
CREATE OR REPLACE FUNCTION notify_on_vendor_referral()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  staff_rec RECORD;
  exh_name TEXT;
BEGIN
  -- Look up exhibition name if linked
  IF NEW.exhibition_id IS NOT NULL THEN
    SELECT name INTO exh_name FROM exhibitions WHERE id = NEW.exhibition_id;
  END IF;
  IF exh_name IS NULL THEN
    exh_name := 'General Referral Program';
  END IF;

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
      'referral',
      'New Vendor Referral',
      CONCAT(NEW.referrer_name, ' referred ', NEW.referred_business_name, ' for 10% credit program (', exh_name, ').'),
      jsonb_build_object(
        'referral_id', NEW.id,
        'referrer_name', NEW.referrer_name,
        'referrer_contact', NEW.referrer_contact,
        'referred_business_name', NEW.referred_business_name,
        'referred_contact', NEW.referred_contact,
        'exhibition_id', NEW.exhibition_id,
        'exhibition_name', exh_name,
        'status', NEW.status
      ),
      FALSE,
      NOW(),
      NOW()
    );
  END LOOP;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_notify_on_vendor_referral ON referrals;
CREATE TRIGGER trigger_notify_on_vendor_referral
AFTER INSERT ON referrals
FOR EACH ROW
EXECUTE FUNCTION notify_on_vendor_referral();
