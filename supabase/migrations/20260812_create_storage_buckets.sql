-- Migration: Create 'exhibitions' Storage Bucket and Storage RLS Policies
-- Description: Creates the public storage bucket for exhibition cover images and expenditure receipts/invoices (PDF & Image).

-- 1. Create / Configure 'exhibitions' bucket in storage.buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'exhibitions',
  'exhibitions',
  true,
  20971520, -- 20 MB max file size
  ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/svg+xml', 'application/pdf']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 20971520,
  allowed_mime_types = ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/svg+xml', 'application/pdf'];

-- 2. Drop existing policies if any to avoid duplication
DROP POLICY IF EXISTS "Public Read on exhibitions bucket" ON storage.objects;
DROP POLICY IF EXISTS "Allow Upload to exhibitions bucket" ON storage.objects;
DROP POLICY IF EXISTS "Allow Update in exhibitions bucket" ON storage.objects;
DROP POLICY IF EXISTS "Allow Delete in exhibitions bucket" ON storage.objects;

-- 3. Policy: Public Read Access (viewable by admin, curators, and clients without extra auth headers)
CREATE POLICY "Public Read on exhibitions bucket"
ON storage.objects FOR SELECT
USING (bucket_id = 'exhibitions');

-- 4. Policy: Allow Uploads (images and PDF receipts)
CREATE POLICY "Allow Upload to exhibitions bucket"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'exhibitions');

-- 5. Policy: Allow Updates / Upserts
CREATE POLICY "Allow Update in exhibitions bucket"
ON storage.objects FOR UPDATE
USING (bucket_id = 'exhibitions');

-- 6. Policy: Allow Delete
CREATE POLICY "Allow Delete in exhibitions bucket"
ON storage.objects FOR DELETE
USING (bucket_id = 'exhibitions');
