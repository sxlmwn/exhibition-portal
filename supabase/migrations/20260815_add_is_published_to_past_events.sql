-- Migration: Add is_published column to past_event_stories table
-- Description:
-- Adds is_published boolean column to past_event_stories table to control 
-- which past events are visible on the public landing page.

-- 1. Add is_published column with default false
ALTER TABLE past_event_stories
  ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT false;

-- Create index on is_published for efficient filtering
CREATE INDEX IF NOT EXISTS idx_past_event_stories_is_published ON past_event_stories(is_published);

-- Add comment to document the column purpose
COMMENT ON COLUMN past_event_stories.is_published IS 
  'Controls visibility on public landing page. Only stories with is_published = true appear on the public site.';
