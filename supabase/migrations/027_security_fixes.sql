-- ============================================================
-- Migration 027: Security Advisor Fixes
-- Fixes RLS, function search paths, and stale session cleanup
-- ============================================================

-- 1. spatial_ref_sys: Revoke public access (we can't enable RLS on PostGIS system tables)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'spatial_ref_sys') THEN
    REVOKE ALL ON public.spatial_ref_sys FROM PUBLIC;
    GRANT SELECT ON public.spatial_ref_sys TO postgres;
    GRANT SELECT ON public.spatial_ref_sys TO anon;
    GRANT SELECT ON public.spatial_ref_sys TO authenticated;
    GRANT SELECT ON public.spatial_ref_sys TO service_role;
  END IF;
END $$;

-- 2. Fix function search_path vulnerabilities
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'set_updated_at' AND pronamespace = 'public'::regnamespace) THEN
    EXECUTE 'ALTER FUNCTION public.set_updated_at() SET search_path = public';
  END IF;
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'is_admin' AND pronamespace = 'public'::regnamespace) THEN
    EXECUTE 'ALTER FUNCTION public.is_admin() SET search_path = public';
  END IF;
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'handle_new_user' AND pronamespace = 'public'::regnamespace) THEN
    EXECUTE 'ALTER FUNCTION public.handle_new_user() SET search_path = public';
  END IF;
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'nearby_breeders' AND pronamespace = 'public'::regnamespace) THEN
    EXECUTE 'ALTER FUNCTION public.nearby_breeders(search_lat double precision, search_lng double precision, max_distance_miles double precision) SET search_path = public';
  END IF;
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'update_breeder_members' AND pronamespace = 'public'::regnamespace) THEN
    EXECUTE 'ALTER FUNCTION public.update_breeder_members() SET search_path = public';
  END IF;
END $$;

-- 3. outreach_sends: add admin-only RLS policy
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'outreach_sends') THEN
    DROP POLICY IF EXISTS "outreach_sends_admin_all" ON public.outreach_sends;
    CREATE POLICY "outreach_sends_admin_all"
      ON public.outreach_sends FOR ALL
      USING (auth.role() = 'service_role' OR auth.uid() IN (SELECT id FROM public.profiles WHERE role IN ('admin', 'super_admin')));
  END IF;
END $$;

-- 4. Tighten overly permissive RLS policies on analytics tables
DO $$
BEGIN
  -- contact_submissions
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'contact_submissions') THEN
    DROP POLICY IF EXISTS "Contact: public insert" ON public.contact_submissions;
    DROP POLICY IF EXISTS "Contact: admin select" ON public.contact_submissions;
    CREATE POLICY "Contact: public insert"
      ON public.contact_submissions FOR INSERT
      WITH CHECK (true);
    CREATE POLICY "Contact: admin select"
      ON public.contact_submissions FOR SELECT
      USING (auth.role() = 'service_role' OR auth.uid() IN (SELECT id FROM public.profiles WHERE role IN ('admin', 'super_admin')));
  END IF;

  -- cookie_consents
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'cookie_consents') THEN
    DROP POLICY IF EXISTS "Cookie consents: public insert" ON public.cookie_consents;
    DROP POLICY IF EXISTS "Cookie consents: admin select" ON public.cookie_consents;
    CREATE POLICY "Cookie consents: public insert"
      ON public.cookie_consents FOR INSERT
      WITH CHECK (true);
    CREATE POLICY "Cookie consents: admin select"
      ON public.cookie_consents FOR SELECT
      USING (auth.role() = 'service_role' OR auth.uid() IN (SELECT id FROM public.profiles WHERE role IN ('admin', 'super_admin')));
  END IF;

  -- cta_clicks
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'cta_clicks') THEN
    DROP POLICY IF EXISTS "CTA clicks: public insert" ON public.cta_clicks;
    DROP POLICY IF EXISTS "CTA clicks: admin select" ON public.cta_clicks;
    CREATE POLICY "CTA clicks: public insert"
      ON public.cta_clicks FOR INSERT
      WITH CHECK (true);
    CREATE POLICY "CTA clicks: admin select"
      ON public.cta_clicks FOR SELECT
      USING (auth.role() = 'service_role' OR auth.uid() IN (SELECT id FROM public.profiles WHERE role IN ('admin', 'super_admin')));
  END IF;

  -- page_views
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'page_views') THEN
    DROP POLICY IF EXISTS "Page views: public insert" ON public.page_views;
    DROP POLICY IF EXISTS "Page views: admin select" ON public.page_views;
    CREATE POLICY "Page views: public insert"
      ON public.page_views FOR INSERT
      WITH CHECK (true);
    CREATE POLICY "Page views: admin select"
      ON public.page_views FOR SELECT
      USING (auth.role() = 'service_role' OR auth.uid() IN (SELECT id FROM public.profiles WHERE role IN ('admin', 'super_admin')));
  END IF;

  -- user_sessions
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_sessions') THEN
    DROP POLICY IF EXISTS "User sessions: public insert" ON public.user_sessions;
    DROP POLICY IF EXISTS "user_sessions_admin_read" ON public.user_sessions;
    CREATE POLICY "User sessions: public insert"
      ON public.user_sessions FOR INSERT
      WITH CHECK (true);
    CREATE POLICY "user_sessions_admin_read"
      ON public.user_sessions FOR SELECT
      USING (auth.role() = 'service_role' OR auth.uid() IN (SELECT id FROM public.profiles WHERE role IN ('admin', 'super_admin')));
  END IF;

  -- search_analytics
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'search_analytics') THEN
    DROP POLICY IF EXISTS "Users can insert own searches" ON public.search_analytics;
    DROP POLICY IF EXISTS "search_analytics_admin_select" ON public.search_analytics;
    CREATE POLICY "Users can insert own searches"
      ON public.search_analytics FOR INSERT
      WITH CHECK (true);
    CREATE POLICY "search_analytics_admin_select"
      ON public.search_analytics FOR SELECT
      USING (auth.role() = 'service_role' OR auth.uid() IN (SELECT id FROM public.profiles WHERE role IN ('admin', 'super_admin')));
  END IF;

  -- seo_page_views
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'seo_page_views') THEN
    DROP POLICY IF EXISTS "Anyone can read SEO stats" ON public.seo_page_views;
    DROP POLICY IF EXISTS "Anyone can insert SEO views" ON public.seo_page_views;
    DROP POLICY IF EXISTS "seo_page_views_public_insert" ON public.seo_page_views;
    DROP POLICY IF EXISTS "seo_page_views_admin_select" ON public.seo_page_views;
    CREATE POLICY "seo_page_views_public_insert"
      ON public.seo_page_views FOR INSERT
      WITH CHECK (true);
    CREATE POLICY "seo_page_views_admin_select"
      ON public.seo_page_views FOR SELECT
      USING (auth.role() = 'service_role' OR auth.uid() IN (SELECT id FROM public.profiles WHERE role IN ('admin', 'super_admin')));
  END IF;
END $$;

-- 5. Clean up stale user_sessions older than 1 day
DELETE FROM public.user_sessions WHERE last_active_at < NOW() - INTERVAL '1 day';

-- 6. Create a function to clean stale sessions (can be called by cron)
CREATE OR REPLACE FUNCTION public.cleanup_stale_sessions()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.user_sessions WHERE last_active_at < NOW() - INTERVAL '1 day';
END;
$$;
