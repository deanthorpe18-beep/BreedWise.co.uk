-- ============================================================
-- Migration 005: Cookie Consent, Email Change Audit, Admin Audit Log
-- ============================================================

-- 1. Cookie Consent Tracking Table
CREATE TABLE IF NOT EXISTS public.cookie_consents (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    anonymous_id text,
    consent_given boolean NOT NULL DEFAULT false,
    essential boolean NOT NULL DEFAULT true,
    analytics boolean NOT NULL DEFAULT false,
    marketing boolean NOT NULL DEFAULT false,
    preferences text,
    ip_address inet,
    user_agent text,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.cookie_consents IS 'GDPR/PECR-compliant cookie consent log for audit trail';

ALTER TABLE public.cookie_consents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Cookie consents: users read own" ON public.cookie_consents;
CREATE POLICY "Cookie consents: users read own"
    ON public.cookie_consents
    FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Cookie consents: public insert" ON public.cookie_consents;
CREATE POLICY "Cookie consents: public insert"
    ON public.cookie_consents
    FOR INSERT
    TO anon, authenticated
    WITH CHECK (true);

DROP POLICY IF EXISTS "Cookie consents: users update own" ON public.cookie_consents;
CREATE POLICY "Cookie consents: users update own"
    ON public.cookie_consents
    FOR UPDATE
    TO authenticated
    USING (user_id = auth.uid());

-- 2. Audit log table for admin actions
CREATE TABLE IF NOT EXISTS public.admin_audit_log (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    action text NOT NULL,
    target_table text,
    target_id uuid,
    old_values jsonb,
    new_values jsonb,
    ip_address inet,
    user_agent text,
    created_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.admin_audit_log IS 'Immutable audit trail of all admin actions';

ALTER TABLE public.admin_audit_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Audit log: admins read" ON public.admin_audit_log;
CREATE POLICY "Audit log: admins read"
    ON public.admin_audit_log
    FOR SELECT
    TO authenticated
    USING (EXISTS (
        SELECT 1 FROM public.profiles p
        WHERE p.id = auth.uid() AND p.role = 'admin'
    ));

DROP POLICY IF EXISTS "Audit log: admins insert" ON public.admin_audit_log;
CREATE POLICY "Audit log: admins insert"
    ON public.admin_audit_log
    FOR INSERT
    TO authenticated
    WITH CHECK (EXISTS (
        SELECT 1 FROM public.profiles p
        WHERE p.id = auth.uid() AND p.role = 'admin'
    ));

-- 3. Email change log
CREATE TABLE IF NOT EXISTS public.email_changes (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    old_email text NOT NULL,
    new_email text NOT NULL,
    confirmed_at timestamptz,
    created_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.email_changes IS 'Audit log of user email address changes';

ALTER TABLE public.email_changes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Email changes: users read own" ON public.email_changes;
CREATE POLICY "Email changes: users read own"
    ON public.email_changes
    FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

-- 4. Triggers for updated_at
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger WHERE tgname = 'cookie_consents_updated_at'
    ) THEN
        CREATE TRIGGER cookie_consents_updated_at
        BEFORE UPDATE ON public.cookie_consents
        FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
    END IF;
END $$;
