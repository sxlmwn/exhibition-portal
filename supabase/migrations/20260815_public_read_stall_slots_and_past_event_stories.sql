-- Migration: Allow public/anon read access on stall_slots and past_event_stories
-- Description:
-- Enables public landing page visitors (anon & authenticated) to fetch live floor plan stall availability
-- and past exhibition portfolio stories directly from Supabase.

-- 1. RLS on stall_slots (Allow public read for interactive live floor plan)
ALTER TABLE stall_slots ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read access on stall_slots" ON stall_slots;
CREATE POLICY "Allow public read access on stall_slots"
ON stall_slots FOR SELECT
TO anon, authenticated
USING (true);

-- 2. RLS on past_event_stories (Allow public read for past event stories showcase)
ALTER TABLE past_event_stories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read access on past_event_stories" ON past_event_stories;
CREATE POLICY "Allow public read access on past_event_stories"
ON past_event_stories FOR SELECT
TO anon, authenticated
USING (true);
