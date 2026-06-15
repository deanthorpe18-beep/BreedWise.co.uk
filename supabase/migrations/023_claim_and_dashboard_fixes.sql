-- Migration 023: Claim approval breeder linking, storage buckets, and dashboard fixes

-- ============================================================================
-- 1. PREVENT DUPLICATE CLAIMS FOR SAME BREEDER BY SAME USER
-- ============================================================================
CREATE UNIQUE INDEX IF NOT EXISTS idx_claims_unique_pending_approved
  ON public.claims (breeder_slug, claimant_user_id)
  WHERE status IN ('pending', 'under_review', 'approved');

-- ============================================================================
-- 2. STORAGE BUCKETS FOR UPLOADS
-- ============================================================================
-- Create breeder-photos bucket (public)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('breeder-photos', 'breeder-photos', true, 2097152, ARRAY['image/jpeg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Create claim-evidence bucket (private)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('claim-evidence', 'claim-evidence', false, 5242880, ARRAY['image/jpeg', 'image/png', 'application/pdf'])
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- ============================================================================
-- 3. STORAGE POLICIES FOR BREEDER-PHOTOS
-- ============================================================================
-- Allow public read
DROP POLICY IF EXISTS "Public can view breeder photos" ON storage.objects;
CREATE POLICY "Public can view breeder photos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'breeder-photos');

-- Allow authenticated users to upload to breeder-photos
DROP POLICY IF EXISTS "Authenticated can upload breeder photos" ON storage.objects;
CREATE POLICY "Authenticated can upload breeder photos"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'breeder-photos');

-- Allow owners to delete their breeder photos
DROP POLICY IF EXISTS "Owners can delete breeder photos" ON storage.objects;
CREATE POLICY "Owners can delete breeder photos"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'breeder-photos');

-- ============================================================================
-- 4. STORAGE POLICIES FOR CLAIM-EVIDENCE
-- ============================================================================
-- Allow authenticated users to upload claim evidence
DROP POLICY IF EXISTS "Authenticated can upload claim evidence" ON storage.objects;
CREATE POLICY "Authenticated can upload claim evidence"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'claim-evidence');

-- Allow users to view their own claim evidence
DROP POLICY IF EXISTS "Users can view own claim evidence" ON storage.objects;
CREATE POLICY "Users can view own claim evidence"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'claim-evidence');

-- ============================================================================
-- 5. BREEDER_PHOTOS RLS: ALLOW BREEDER OWNERS TO MANAGE THEIR PHOTOS
-- ============================================================================
DROP POLICY IF EXISTS "Breeder owners can insert photos" ON public.breeder_photos;
CREATE POLICY "Breeder owners can insert photos"
  ON public.breeder_photos FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.breeder_subscriptions bs
      WHERE bs.breeder_id = breeder_photos.breeder_id
      AND bs.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Breeder owners can delete photos" ON public.breeder_photos;
CREATE POLICY "Breeder owners can delete photos"
  ON public.breeder_photos FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.breeder_subscriptions bs
      WHERE bs.breeder_id = breeder_photos.breeder_id
      AND bs.user_id = auth.uid()
    )
  );
