-- Admin analytics and audit logging tables

-- Page views tracking
CREATE TABLE IF NOT EXISTS public.page_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  breeder_slug text,
  page_path text,
  ip_hash text,
  user_agent text,
  referrer text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_page_views_breeder_slug ON public.page_views(breeder_slug);
CREATE INDEX IF NOT EXISTS idx_page_views_created_at ON public.page_views(created_at);
CREATE INDEX IF NOT EXISTS idx_page_views_page_path ON public.page_views(page_path);

-- CTA click tracking
CREATE TABLE IF NOT EXISTS public.cta_clicks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  breeder_slug text NOT NULL,
  action_type text NOT NULL CHECK (action_type IN ('call', 'website', 'save', 'claim', 'email', 'directions')),
  ip_hash text,
  user_agent text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_cta_clicks_breeder_slug ON public.cta_clicks(breeder_slug);
CREATE INDEX IF NOT EXISTS idx_cta_clicks_action_type ON public.cta_clicks(action_type);
CREATE INDEX IF NOT EXISTS idx_cta_clicks_created_at ON public.cta_clicks(created_at);

-- Breeder audit log (what changed and when)
CREATE TABLE IF NOT EXISTS public.breeder_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  breeder_id uuid REFERENCES public.breeders(id) ON DELETE CASCADE,
  breeder_slug text NOT NULL,
  action text NOT NULL CHECK (action IN ('create', 'update', 'delete', 'claim_approved', 'claim_rejected', 'status_changed')),
  changed_by uuid REFERENCES auth.users(id),
  changed_by_email text,
  old_values jsonb,
  new_values jsonb,
  changed_fields text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_breeder_audit_log_breeder_slug ON public.breeder_audit_log(breeder_slug);
CREATE INDEX IF NOT EXISTS idx_breeder_audit_log_created_at ON public.breeder_audit_log(created_at);

-- User sessions (for online counter)
CREATE TABLE IF NOT EXISTS public.user_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_hash text NOT NULL,
  user_agent text,
  last_active_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_user_sessions_last_active ON public.user_sessions(last_active_at);

-- RLS Policies
ALTER TABLE public.page_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cta_clicks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.breeder_audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;

-- Only admins can read analytics
DROP POLICY IF EXISTS "Page views: admins read" ON public.page_views;
CREATE POLICY "Page views: admins read"
  ON public.page_views FOR SELECT
  USING (public.is_admin());

DROP POLICY IF EXISTS "Page views: public insert" ON public.page_views;
CREATE POLICY "Page views: public insert"
  ON public.page_views FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "CTA clicks: admins read" ON public.cta_clicks;
CREATE POLICY "CTA clicks: admins read"
  ON public.cta_clicks FOR SELECT
  USING (public.is_admin());

DROP POLICY IF EXISTS "CTA clicks: public insert" ON public.cta_clicks;
CREATE POLICY "CTA clicks: public insert"
  ON public.cta_clicks FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Breeder audit log: admins read" ON public.breeder_audit_log;
CREATE POLICY "Breeder audit log: admins read"
  ON public.breeder_audit_log FOR SELECT
  USING (public.is_admin());

DROP POLICY IF EXISTS "Breeder audit log: admins insert" ON public.breeder_audit_log;
CREATE POLICY "Breeder audit log: admins insert"
  ON public.breeder_audit_log FOR INSERT
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "User sessions: admins read" ON public.user_sessions;
CREATE POLICY "User sessions: admins read"
  ON public.user_sessions FOR SELECT
  USING (public.is_admin());

DROP POLICY IF EXISTS "User sessions: public insert" ON public.user_sessions;
CREATE POLICY "User sessions: public insert"
  ON public.user_sessions FOR INSERT
  WITH CHECK (true);

-- Function to auto-log breeder changes
CREATE OR REPLACE FUNCTION public.log_breeder_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  old_json jsonb;
  new_json jsonb;
  changed text[] := '{}';
  key text;
BEGIN
  IF TG_OP = 'DELETE' THEN
    INSERT INTO public.breeder_audit_log (
      breeder_id, breeder_slug, action, changed_by, old_values
    ) VALUES (
      OLD.id, OLD.slug, 'delete', auth.uid(), to_jsonb(OLD)
    );
    RETURN OLD;
  ELSIF TG_OP = 'INSERT' THEN
    INSERT INTO public.breeder_audit_log (
      breeder_id, breeder_slug, action, changed_by, new_values
    ) VALUES (
      NEW.id, NEW.slug, 'create', auth.uid(), to_jsonb(NEW)
    );
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    old_json := to_jsonb(OLD);
    new_json := to_jsonb(NEW);
    
    -- Find changed fields
    FOR key IN SELECT jsonb_object_keys(new_json) LOOP
      IF old_json->key IS DISTINCT FROM new_json->key THEN
        changed := array_append(changed, key);
      END IF;
    END LOOP;
    
    IF array_length(changed, 1) > 0 THEN
      INSERT INTO public.breeder_audit_log (
        breeder_id, breeder_slug, action, changed_by, 
        old_values, new_values, changed_fields
      ) VALUES (
        NEW.id, NEW.slug, 'update', auth.uid(),
        old_json - (SELECT array_agg(k) FROM unnest(changed) AS k),
        new_json - (SELECT array_agg(k) FROM unnest(changed) AS k),
        changed
      );
    END IF;
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$;

-- Attach trigger to breeders table
DROP TRIGGER IF EXISTS breeder_audit_trigger ON public.breeders;
CREATE TRIGGER breeder_audit_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.breeders
  FOR EACH ROW
  EXECUTE FUNCTION public.log_breeder_change();

-- Function to clean old sessions (run via cron or manually)
CREATE OR REPLACE FUNCTION public.cleanup_old_sessions(minutes integer DEFAULT 30)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  deleted_count integer;
BEGIN
  DELETE FROM public.user_sessions
  WHERE last_active_at < now() - interval '1 minute' * minutes;
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$;
