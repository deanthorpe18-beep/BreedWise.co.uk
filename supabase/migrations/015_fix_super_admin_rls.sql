-- Migration 015: Fix RLS policies to include super_admin
-- Problem: Many admin-only RLS policies only check role = 'admin', excluding super_admin.
-- This prevents super_admin users from seeing/managing claims, removals, audit logs, etc.
-- Fix: Update all admin-only policies to check role IN ('admin', 'super_admin').

-- ============================================
-- CLAIMS TABLE
-- ============================================
DROP POLICY IF EXISTS "Claims: users read own" ON public.claims;
DROP POLICY IF EXISTS "Claims: admins update all" ON public.claims;

CREATE POLICY "Claims: users read own"
  ON public.claims FOR SELECT
  USING (
    claimant_user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Claims: admins update all"
  ON public.claims FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role IN ('admin', 'super_admin')
    )
  );

-- ============================================
-- REMOVALS TABLE
-- ============================================
DROP POLICY IF EXISTS "Removals: users read own" ON public.removals;
DROP POLICY IF EXISTS "Removals: admins update all" ON public.removals;

CREATE POLICY "Removals: users read own"
  ON public.removals FOR SELECT
  USING (
    requester_user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Removals: admins update all"
  ON public.removals FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role IN ('admin', 'super_admin')
    )
  );

-- ============================================
-- BREEDER_UPDATES TABLE
-- ============================================
DROP POLICY IF EXISTS "Breeder updates: users read own" ON public.breeder_updates;
DROP POLICY IF EXISTS "Breeder updates: admins read all" ON public.breeder_updates;
DROP POLICY IF EXISTS "Breeder updates: admins update all" ON public.breeder_updates;

CREATE POLICY "Breeder updates: admins all"
  ON public.breeder_updates FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role IN ('admin', 'super_admin')
    )
  );

-- ============================================
-- CONTACT_SUBMISSIONS TABLE
-- ============================================
DROP POLICY IF EXISTS "Contact: admins read all" ON public.contact_submissions;

CREATE POLICY "Contact: admins read all"
  ON public.contact_submissions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role IN ('admin', 'super_admin')
    )
  );

-- ============================================
-- ADMIN_AUDIT_LOG TABLE
-- ============================================
DROP POLICY IF EXISTS "Audit log: admins read" ON public.admin_audit_log;
DROP POLICY IF EXISTS "Audit log: admins insert" ON public.admin_audit_log;

CREATE POLICY "Audit log: admins read"
  ON public.admin_audit_log FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Audit log: admins insert"
  ON public.admin_audit_log FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role IN ('admin', 'super_admin')
    )
  );

-- ============================================
-- CMS_CONTENT TABLE
-- ============================================
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'cms_content') THEN
    DROP POLICY IF EXISTS "cms_content_admin_all" ON public.cms_content;
    CREATE POLICY "cms_content_admin_all"
      ON public.cms_content FOR ALL
      USING (
        EXISTS (
          SELECT 1 FROM public.profiles p
          WHERE p.id = auth.uid() AND p.role IN ('admin', 'super_admin')
        )
      );
  END IF;
END $$;

-- ============================================
-- SEARCH_ANALYTICS TABLE
-- ============================================
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'search_analytics') THEN
    DROP POLICY IF EXISTS "search_analytics_admin_read" ON public.search_analytics;
    CREATE POLICY "search_analytics_admin_read"
      ON public.search_analytics FOR SELECT
      USING (
        EXISTS (
          SELECT 1 FROM public.profiles p
          WHERE p.id = auth.uid() AND p.role IN ('admin', 'super_admin')
        )
      );
  END IF;
END $$;

-- ============================================
-- USER_SESSIONS TABLE
-- ============================================
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_sessions') THEN
    DROP POLICY IF EXISTS "user_sessions_admin_read" ON public.user_sessions;
    CREATE POLICY "user_sessions_admin_read"
      ON public.user_sessions FOR SELECT
      USING (
        EXISTS (
          SELECT 1 FROM public.profiles p
          WHERE p.id = auth.uid() AND p.role IN ('admin', 'super_admin')
        )
      );
  END IF;
END $$;

-- ============================================
-- PAGE_VIEWS TABLE
-- ============================================
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'page_views') THEN
    DROP POLICY IF EXISTS "page_views_admin_read" ON public.page_views;
    CREATE POLICY "page_views_admin_read"
      ON public.page_views FOR SELECT
      USING (
        EXISTS (
          SELECT 1 FROM public.profiles p
          WHERE p.id = auth.uid() AND p.role IN ('admin', 'super_admin')
        )
      );
  END IF;
END $$;

-- ============================================
-- CTA_CLICKS TABLE
-- ============================================
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'cta_clicks') THEN
    DROP POLICY IF EXISTS "cta_clicks_admin_read" ON public.cta_clicks;
    CREATE POLICY "cta_clicks_admin_read"
      ON public.cta_clicks FOR SELECT
      USING (
        EXISTS (
          SELECT 1 FROM public.profiles p
          WHERE p.id = auth.uid() AND p.role IN ('admin', 'super_admin')
        )
      );
  END IF;
END $$;

-- ============================================
-- BREEDER_PHOTOS TABLE
-- ============================================
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'breeder_photos') THEN
    DROP POLICY IF EXISTS "breeder_photos_admin_all" ON public.breeder_photos;
    CREATE POLICY "breeder_photos_admin_all"
      ON public.breeder_photos FOR ALL
      USING (
        EXISTS (
          SELECT 1 FROM public.profiles p
          WHERE p.id = auth.uid() AND p.role IN ('admin', 'super_admin')
        )
      );
  END IF;
END $$;

-- ============================================
-- FEATURED_BREEDERS TABLE (skip if not exists)
-- ============================================
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'featured_breeders') THEN
    DROP POLICY IF EXISTS "featured_breeders_admin_all" ON public.featured_breeders;
    CREATE POLICY "featured_breeders_admin_all"
      ON public.featured_breeders FOR ALL
      USING (
        EXISTS (
          SELECT 1 FROM public.profiles p
          WHERE p.id = auth.uid() AND p.role IN ('admin', 'super_admin')
        )
      );
  END IF;
END $$;
