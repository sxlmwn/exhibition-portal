-- Migration: Add stall_registration_deadline to exhibitions table
-- Description:
-- Adds stall_registration_deadline date column to exhibitions table to control when 
-- public booking closes and when admin allocation window begins.

-- 1. Add stall_registration_deadline column
ALTER TABLE exhibitions
  ADD COLUMN IF NOT EXISTS stall_registration_deadline DATE;

-- Create index on stall_registration_deadline for efficient filtering
CREATE INDEX IF NOT EXISTS idx_exhibitions_stall_registration_deadline ON exhibitions(stall_registration_deadline);

-- Add comment to document the column purpose
COMMENT ON COLUMN exhibitions.stall_registration_deadline IS 
  'Deadline after which public stall booking closes. Admin allocation window runs for 3 days after this date.';
