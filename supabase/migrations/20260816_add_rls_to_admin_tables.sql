-- Migration: Enable Row Level Security (RLS) on admin-internal tables
-- Date: 2026-08-16
-- Description:
-- Secures crm_contacts, expense_items, marketing_campaigns, and staff_users with RLS policies.
-- These tables are internal to the admin portal and are never queried by the public landing site.
-- All anonymous access is blocked. Authenticated access is restricted according to user roles.

-- ==============================================================================
-- 1. crm_contacts
-- ==============================================================================
ALTER TABLE crm_contacts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow authenticated full access on crm_contacts" ON crm_contacts;
CREATE POLICY "Allow authenticated full access on crm_contacts"
ON crm_contacts
FOR ALL
TO authenticated
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

-- ==============================================================================
-- 2. expense_items
-- ==============================================================================
-- Role-based entry: any authenticated staff/owner can view and log expenses.
-- Only owners (staff_users.role = 'owner') can approve, edit, or delete expenses.
ALTER TABLE expense_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow authenticated users to read expense_items" ON expense_items;
CREATE POLICY "Allow authenticated users to read expense_items"
ON expense_items
FOR SELECT
TO authenticated
USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Allow authenticated users to insert expense_items" ON expense_items;
CREATE POLICY "Allow authenticated users to insert expense_items"
ON expense_items
FOR INSERT
TO authenticated
WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Allow owner users to update expense_items" ON expense_items;
CREATE POLICY "Allow owner users to update expense_items"
ON expense_items
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM staff_users 
    WHERE staff_users.auth_id = auth.uid() 
      AND staff_users.role = 'owner'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM staff_users 
    WHERE staff_users.auth_id = auth.uid() 
      AND staff_users.role = 'owner'
  )
);

DROP POLICY IF EXISTS "Allow owner users to delete expense_items" ON expense_items;
CREATE POLICY "Allow owner users to delete expense_items"
ON expense_items
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM staff_users 
    WHERE staff_users.auth_id = auth.uid() 
      AND staff_users.role = 'owner'
  )
);

-- ==============================================================================
-- 3. marketing_campaigns
-- ==============================================================================
ALTER TABLE marketing_campaigns ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow authenticated full access on marketing_campaigns" ON marketing_campaigns;
CREATE POLICY "Allow authenticated full access on marketing_campaigns"
ON marketing_campaigns
FOR ALL
TO authenticated
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

-- ==============================================================================
-- 4. staff_users
-- ==============================================================================
-- Any authenticated user can read team members list.
-- Only owner users can directly insert, update, or delete staff records.
-- (Note: Server-side route /api/staff/invite uses SUPABASE_SERVICE_ROLE_KEY which bypasses RLS)
ALTER TABLE staff_users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow authenticated users to read staff_users" ON staff_users;
CREATE POLICY "Allow authenticated users to read staff_users"
ON staff_users
FOR SELECT
TO authenticated
USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Allow owner users to insert staff_users" ON staff_users;
CREATE POLICY "Allow owner users to insert staff_users"
ON staff_users
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM staff_users 
    WHERE staff_users.auth_id = auth.uid() 
      AND staff_users.role = 'owner'
  )
);

DROP POLICY IF EXISTS "Allow owner users to update staff_users" ON staff_users;
CREATE POLICY "Allow owner users to update staff_users"
ON staff_users
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM staff_users 
    WHERE staff_users.auth_id = auth.uid() 
      AND staff_users.role = 'owner'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM staff_users 
    WHERE staff_users.auth_id = auth.uid() 
      AND staff_users.role = 'owner'
  )
);

DROP POLICY IF EXISTS "Allow owner users to delete staff_users" ON staff_users;
CREATE POLICY "Allow owner users to delete staff_users"
ON staff_users
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM staff_users 
    WHERE staff_users.auth_id = auth.uid() 
      AND staff_users.role = 'owner'
  )
);
