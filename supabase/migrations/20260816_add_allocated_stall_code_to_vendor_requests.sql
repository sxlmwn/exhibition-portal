-- ==============================================================================
-- EXHIBITION PLATFORM: ADD allocated_stall_code TO vendor_requests
-- Execute this script in your Supabase Project -> SQL Editor
-- ==============================================================================

-- 1. Add allocated_stall_code column to vendor_requests table
ALTER TABLE IF EXISTS vendor_requests
  ADD COLUMN IF NOT EXISTS allocated_stall_code text;

-- 2. Configure Row Level Security (RLS) policies on vendor_requests
ALTER TABLE IF EXISTS vendor_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read vendor_requests" ON vendor_requests;
CREATE POLICY "Allow public read vendor_requests"
ON vendor_requests
FOR SELECT
TO anon, authenticated
USING (true);

DROP POLICY IF EXISTS "Allow all on vendor_requests" ON vendor_requests;
CREATE POLICY "Allow all on vendor_requests"
ON vendor_requests
FOR ALL
TO anon, authenticated
USING (true)
WITH CHECK (true);
