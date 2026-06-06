-- Fix infinite recursion in profiles RLS policies
-- The "admins read all" policy was querying profiles within a profiles policy,
-- causing infinite recursion. We use a SECURITY DEFINER function instead.

-- Create helper function to check admin status (bypasses RLS)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$;

-- Drop the recursive policy
DROP POLICY IF EXISTS "Profiles: admins read all" ON public.profiles;

-- Recreate with non-recursive function
CREATE POLICY "Profiles: admins read all"
  ON public.profiles FOR SELECT
  USING (public.is_admin());

-- Also fix other policies that reference profiles within profiles
-- (Breeder updates uses profiles check too, but that's on a different table so it's fine)

-- Ensure other table policies use the function too for consistency
DROP POLICY IF EXISTS "Breeders: admin manage" ON public.breeders;
CREATE POLICY "Breeders: admin manage"
  ON public.breeders FOR ALL
  USING (public.is_admin());

DROP POLICY IF EXISTS "Breeder breeds: admin manage" ON public.breeder_breeds;
CREATE POLICY "Breeder breeds: admin manage"
  ON public.breeder_breeds FOR ALL
  USING (public.is_admin());

DROP POLICY IF EXISTS "Claims: admins update all" ON public.claims;
CREATE POLICY "Claims: admins update all"
  ON public.claims FOR UPDATE
  USING (public.is_admin());

DROP POLICY IF EXISTS "Removals: admins update all" ON public.removals;
CREATE POLICY "Removals: admins update all"
  ON public.removals FOR UPDATE
  USING (public.is_admin());

DROP POLICY IF EXISTS "Contact: admins read all" ON public.contact_submissions;
CREATE POLICY "Contact: admins read all"
  ON public.contact_submissions FOR SELECT
  USING (public.is_admin());

DROP POLICY IF EXISTS "Google refresh: admin read" ON public.google_refresh_log;
CREATE POLICY "Google refresh: admin read"
  ON public.google_refresh_log FOR SELECT
  USING (public.is_admin());

DROP POLICY IF EXISTS "Breeder photos: admin manage" ON public.breeder_photos;
CREATE POLICY "Breeder photos: admin manage"
  ON public.breeder_photos FOR ALL
  USING (public.is_admin());

DROP POLICY IF EXISTS "Audit log: admins read" ON public.admin_audit_log;
CREATE POLICY "Audit log: admins read"
  ON public.admin_audit_log FOR SELECT
  USING (public.is_admin());

DROP POLICY IF EXISTS "Audit log: admins insert" ON public.admin_audit_log;
CREATE POLICY "Audit log: admins insert"
  ON public.admin_audit_log FOR INSERT
  WITH CHECK (public.is_admin());
