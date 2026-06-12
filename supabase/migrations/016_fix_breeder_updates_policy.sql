-- Migration 016: Fix breeder_updates policy name conflict
-- The previous migration tried to create "Breeder updates: admins all" but it already exists.
-- Drop all conflicting policies and recreate with a unique name.

DO $$
BEGIN
  -- Drop any existing breeder_updates admin policies
  DROP POLICY IF EXISTS "Breeder updates: users read own" ON public.breeder_updates;
  DROP POLICY IF EXISTS "Breeder updates: admins read all" ON public.breeder_updates;
  DROP POLICY IF EXISTS "Breeder updates: admins update all" ON public.breeder_updates;
  DROP POLICY IF EXISTS "Breeder updates: admins all" ON public.breeder_updates;

  -- Recreate with a unique name
  CREATE POLICY "Breeder updates: super_admin and admin access"
    ON public.breeder_updates FOR ALL
    USING (
      EXISTS (
        SELECT 1 FROM public.profiles p
        WHERE p.id = auth.uid() AND p.role IN ('admin', 'super_admin')
      )
    );
END $$;
