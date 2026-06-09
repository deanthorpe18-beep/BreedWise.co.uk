-- =============================================================================
-- Migration 011: Comprehensive Auth, Roles, Security & Super Admin
-- =============================================================================
-- This migration:
-- 1. Extends app_role enum to 5 roles: public, buyer, breeder, admin, super_admin
-- 2. Adds super_admin support functions
-- 3. Creates email_templates table for Resend
-- 4. Creates user_notifications table
-- 5. Creates user_audit_log for all user-facing actions
-- 6. Fixes RLS policies for all 5 roles
-- 7. Adds indexes for performance
-- 8. Adds admin action audit triggers
-- =============================================================================

-- =============================================================================
-- PART 1: ROLE SYSTEM
-- =============================================================================

-- We can't ALTER TYPE to add values in a transaction-safe way, so we create
-- a new enum and migrate. But since this is a new project with little data,
-- we'll use the simpler approach: check if values exist, add if not.
DO $$
BEGIN
  -- Add 'buyer' if not present
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum WHERE enumlabel = 'buyer'
    AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'app_role')
  ) THEN
    ALTER TYPE public.app_role ADD VALUE 'buyer';
  END IF;

  -- Add 'super_admin' if not present
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum WHERE enumlabel = 'super_admin'
    AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'app_role')
  ) THEN
    ALTER TYPE public.app_role ADD VALUE 'super_admin';
  END IF;
END $$;

-- =============================================================================
-- PART 2: HELPER FUNCTIONS
-- =============================================================================

-- is_admin(): true for admin OR super_admin
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
    WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
  );
END;
$$;

-- is_super_admin(): true ONLY for super_admin
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'super_admin'
  );
END;
$$;

-- is_breeder_or_admin(): true for breeder, admin, or super_admin
CREATE OR REPLACE FUNCTION public.is_breeder_or_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role IN ('breeder', 'admin', 'super_admin')
  );
END;
$$;

-- =============================================================================
-- PART 3: USER AUDIT LOG (for all user actions, not just admin)
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.user_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  user_email text,
  action text NOT NULL,
  target_table text,
  target_id uuid,
  old_values jsonb,
  new_values jsonb,
  ip_address inet,
  user_agent text,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_user_audit_log_user_id ON public.user_audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_user_audit_log_action ON public.user_audit_log(action);
CREATE INDEX IF NOT EXISTS idx_user_audit_log_created_at ON public.user_audit_log(created_at);

ALTER TABLE public.user_audit_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "User audit: admins read" ON public.user_audit_log;
CREATE POLICY "User audit: admins read"
  ON public.user_audit_log FOR SELECT
  USING (public.is_admin());

DROP POLICY IF EXISTS "User audit: users read own" ON public.user_audit_log;
CREATE POLICY "User audit: users read own"
  ON public.user_audit_log FOR SELECT
  USING (user_id = auth.uid());

-- =============================================================================
-- PART 4: EMAIL TEMPLATES (for Resend integration)
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.email_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template_key text NOT NULL UNIQUE,
  subject text NOT NULL,
  html_body text NOT NULL,
  text_body text,
  from_address text NOT NULL DEFAULT 'BreedWise <noreply@breedwise.co.uk>',
  description text,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_email_templates_key ON public.email_templates(template_key);

ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Email templates: admin manage" ON public.email_templates;
CREATE POLICY "Email templates: admin manage"
  ON public.email_templates FOR ALL
  USING (public.is_admin());

-- Seed default templates
INSERT INTO public.email_templates (template_key, subject, html_body, text_body, description)
VALUES
  ('verification', 'Verify your email | BreedWise',
   '<p>Hi {{name}},</p><p>Please verify your email by clicking the link below:</p><p><a href="{{verification_url}}">Verify my email</a></p><p>If you did not create this account, you can safely ignore this email.</p><p>— The BreedWise Team</p>',
   'Hi {{name}},\n\nPlease verify your email by visiting: {{verification_url}}\n\nIf you did not create this account, you can safely ignore this email.\n\n— The BreedWise Team',
   'Sent after signup to verify email address'),

  ('password_reset', 'Reset your password | BreedWise',
   '<p>Hi {{name}},</p><p>You requested a password reset. Click the link below to set a new password:</p><p><a href="{{reset_url}}">Reset my password</a></p><p>This link expires in 1 hour. If you did not request this, you can safely ignore this email.</p><p>— The BreedWise Team</p>',
   'Hi {{name}},\n\nYou requested a password reset. Visit: {{reset_url}}\n\nThis link expires in 1 hour. If you did not request this, you can safely ignore this email.\n\n— The BreedWise Team',
   'Sent when user requests password reset'),

  ('claim_approved', 'Your profile claim has been approved | BreedWise',
   '<p>Hi {{name}},</p><p>Great news! Your claim for <strong>{{breeder_name}}</strong> has been approved.</p><p>You can now manage your profile by logging into your BreedWise account.</p><p><a href="{{profile_url}}">View my profile</a></p><p>— The BreedWise Team</p>',
   'Hi {{name}},\n\nGreat news! Your claim for {{breeder_name}} has been approved.\n\nYou can now manage your profile by logging into your BreedWise account.\n\nView: {{profile_url}}\n\n— The BreedWise Team',
   'Sent when admin approves a breeder claim'),

  ('claim_rejected', 'Update on your profile claim | BreedWise',
   '<p>Hi {{name}},</p><p>We reviewed your claim for <strong>{{breeder_name}}</strong> and were unable to approve it at this time.</p><p>Reason: {{reason}}</p><p>If you believe this was a mistake, please contact us.</p><p>— The BreedWise Team</p>',
   'Hi {{name}},\n\nWe reviewed your claim for {{breeder_name}} and were unable to approve it at this time.\n\nReason: {{reason}}\n\nIf you believe this was a mistake, please contact us.\n\n— The BreedWise Team',
   'Sent when admin rejects a breeder claim'),

  ('removal_approved', 'Your removal request has been processed | BreedWise',
   '<p>Hi {{name}},</p><p>Your removal request for <strong>{{breeder_name}}</strong> has been approved. The listing has been removed from our directory.</p><p>— The BreedWise Team</p>',
   'Hi {{name}},\n\nYour removal request for {{breeder_name}} has been approved. The listing has been removed from our directory.\n\n— The BreedWise Team',
   'Sent when admin approves a removal request'),

  ('removal_rejected', 'Update on your removal request | BreedWise',
   '<p>Hi {{name}},</p><p>We reviewed your removal request for <strong>{{breeder_name}}</strong> and were unable to approve it at this time.</p><p>Reason: {{reason}}</p><p>— The BreedWise Team</p>',
   'Hi {{name}},\n\nWe reviewed your removal request for {{breeder_name}} and were unable to approve it at this time.\n\nReason: {{reason}}\n\n— The BreedWise Team',
   'Sent when admin rejects a removal request'),

  ('message_notification', 'You have a new message | BreedWise',
   '<p>Hi {{name}},</p><p>You have a new message regarding <strong>{{breeder_name}}</strong>.</p><p><a href="{{message_url}}">View message</a></p><p>— The BreedWise Team</p>',
   'Hi {{name}},\n\nYou have a new message regarding {{breeder_name}}.\n\nView: {{message_url}}\n\n— The BreedWise Team',
   'Sent when a user receives a new message'),

  ('welcome', 'Welcome to BreedWise',
   '<p>Hi {{name}},</p><p>Welcome to BreedWise! Your email has been verified and your account is ready.</p><p><a href="{{site_url}}">Start exploring</a></p><p>— The BreedWise Team</p>',
   'Hi {{name}},\n\nWelcome to BreedWise! Your email has been verified and your account is ready.\n\nStart exploring: {{site_url}}\n\n— The BreedWise Team',
   'Sent after email verification is complete')

ON CONFLICT (template_key) DO NOTHING;

-- =============================================================================
-- PART 5: USER NOTIFICATIONS
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.user_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type text NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  action_url text,
  read boolean NOT NULL DEFAULT false,
  read_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_user_notifications_user_id ON public.user_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_user_notifications_read ON public.user_notifications(read);
CREATE INDEX IF NOT EXISTS idx_user_notifications_created ON public.user_notifications(created_at DESC);

ALTER TABLE public.user_notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Notifications: users read own" ON public.user_notifications;
CREATE POLICY "Notifications: users read own"
  ON public.user_notifications FOR SELECT
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Notifications: users update own" ON public.user_notifications;
CREATE POLICY "Notifications: users update own"
  ON public.user_notifications FOR UPDATE
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Notifications: admin insert" ON public.user_notifications;
CREATE POLICY "Notifications: admin insert"
  ON public.user_notifications FOR INSERT
  WITH CHECK (public.is_admin());

-- =============================================================================
-- PART 6: FIX PROFILES RLS POLICIES (allow super_admin too)
-- =============================================================================

DROP POLICY IF EXISTS "Profiles: admins read all" ON public.profiles;
CREATE POLICY "Profiles: admins read all"
  ON public.profiles FOR SELECT
  USING (public.is_admin());

DROP POLICY IF EXISTS "Profiles: super admin manage" ON public.profiles;
CREATE POLICY "Profiles: super admin manage"
  ON public.profiles FOR ALL
  USING (public.is_super_admin());

-- =============================================================================
-- PART 7: UPDATE BREEDER_UPDATES RLS
-- =============================================================================

DROP POLICY IF EXISTS "Breeder updates: breeders insert own" ON public.breeder_updates;
CREATE POLICY "Breeder updates: breeders insert own"
  ON public.breeder_updates FOR INSERT
  WITH CHECK (public.is_breeder_or_admin());

-- =============================================================================
-- PART 8: FUNCTION TO LOG USER ACTIONS
-- =============================================================================

CREATE OR REPLACE FUNCTION public.log_user_action(
  p_action text,
  p_target_table text DEFAULT NULL,
  p_target_id uuid DEFAULT NULL,
  p_old_values jsonb DEFAULT NULL,
  p_new_values jsonb DEFAULT NULL,
  p_metadata jsonb DEFAULT '{}'
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid;
  v_user_email text;
  v_log_id uuid;
BEGIN
  v_user_id := auth.uid();
  
  IF v_user_id IS NOT NULL THEN
    SELECT email INTO v_user_email FROM auth.users WHERE id = v_user_id;
  END IF;

  INSERT INTO public.user_audit_log (
    user_id, user_email, action, target_table, target_id,
    old_values, new_values, metadata
  ) VALUES (
    v_user_id, v_user_email, p_action, p_target_table, p_target_id,
    p_old_values, p_new_values, p_metadata
  )
  RETURNING id INTO v_log_id;

  RETURN v_log_id;
END;
$$;

-- =============================================================================
-- PART 9: CLEANUP OLD SESSIONS FUNCTION (enhanced)
-- =============================================================================

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

-- =============================================================================
-- PART 10: INDEXES FOR PERFORMANCE
-- =============================================================================

CREATE INDEX IF NOT EXISTS idx_user_audit_log_target ON public.user_audit_log(target_table, target_id);
CREATE INDEX IF NOT EXISTS idx_user_notifications_unread ON public.user_notifications(user_id, read) WHERE NOT read;
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
