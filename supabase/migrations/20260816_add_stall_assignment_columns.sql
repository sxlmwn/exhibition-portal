-- ==============================================================================
-- EXHIBITION PLATFORM: STALL SLOTS ASSIGNED VENDOR COLUMNS MIGRATION
-- Execute this script in your Supabase Project -> SQL Editor
-- ==============================================================================

-- 1. Add assigned vendor & brand columns to stall_slots table
ALTER TABLE IF EXISTS stall_slots
  ADD COLUMN IF NOT EXISTS assigned_vendor_id bigint REFERENCES vendor_requests(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS assigned_vendor_name text,
  ADD COLUMN IF NOT EXISTS assigned_brand_name text,
  ADD COLUMN IF NOT EXISTS assigned_at timestamptz;

-- 2. Configure Row Level Security (RLS) policies on stall_slots
ALTER TABLE IF EXISTS stall_slots ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read stall_slots" ON stall_slots;
CREATE POLICY "Allow public read stall_slots"
ON stall_slots
FOR SELECT
TO anon, authenticated
USING (true);

DROP POLICY IF EXISTS "Allow all on stall_slots" ON stall_slots;
CREATE POLICY "Allow all on stall_slots"
ON stall_slots
FOR ALL
TO anon, authenticated
USING (true)
WITH CHECK (true);
