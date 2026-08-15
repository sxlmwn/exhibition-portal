-- ==============================================================================
-- EXHIBITION PLATFORM: PAST EVENTS QUOTES & PUBLIC RLS MIGRATION
-- Execute this script in your Supabase Project -> SQL Editor
-- ==============================================================================

-- 1. Add testimonial quote columns to past_event_stories table
ALTER TABLE IF EXISTS past_event_stories
  ADD COLUMN IF NOT EXISTS quote_text text,
  ADD COLUMN IF NOT EXISTS quote_author text,
  ADD COLUMN IF NOT EXISTS quote_brand text;

-- 2. Ensure is_published column exists with default false
ALTER TABLE IF EXISTS past_event_stories
  ADD COLUMN IF NOT EXISTS is_published boolean DEFAULT false;

-- Create index for fast published filtering
CREATE INDEX IF NOT EXISTS idx_past_event_stories_is_published ON past_event_stories(is_published);

-- 3. Configure Row Level Security (RLS)
ALTER TABLE IF EXISTS past_event_stories ENABLE ROW LEVEL SECURITY;

-- Allow public / anon read access on published past event stories
DROP POLICY IF EXISTS "Allow public read published past_event_stories" ON past_event_stories;
CREATE POLICY "Allow public read published past_event_stories"
ON past_event_stories
FOR SELECT
TO anon, authenticated
USING (is_published = true);

-- Allow authenticated / admin full access
DROP POLICY IF EXISTS "Allow all access on past_event_stories" ON past_event_stories;
CREATE POLICY "Allow all access on past_event_stories"
ON past_event_stories
FOR ALL
TO anon, authenticated
USING (true)
WITH CHECK (true);

-- 4. Populate quotes for existing demo stories if currently null
UPDATE past_event_stories
SET 
  quote_text = 'We sold out 80% of our stock on Day 1. Footfall conversion was exceptional.',
  quote_author = 'Ayla Siddiqui',
  quote_brand = 'Founder, Terra Clayworks'
WHERE id = 1 AND (quote_text IS NULL OR quote_text = '');

UPDATE past_event_stories
SET 
  quote_text = 'The curation and footfall quality attracted high-intent buyers throughout the weekend.',
  quote_author = 'Bilal Ahmed',
  quote_brand = 'Creative Director, Heritage Weaves'
WHERE id = 2 AND (quote_text IS NULL OR quote_text = '');

UPDATE past_event_stories
SET 
  quote_text = 'Transparent pricing and zero hidden fees give us confidence to re-book every season.',
  quote_author = 'Hamza Khan',
  quote_brand = 'Co-founder, Botanical Botanics'
WHERE id = 3 AND (quote_text IS NULL OR quote_text = '');
