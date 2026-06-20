-- Breed encyclopedia image review flag + storage bucket + newsletter campaigns

ALTER TABLE public.breeds
  ADD COLUMN IF NOT EXISTS image_reviewed boolean DEFAULT false;

COMMENT ON COLUMN public.breeds.image_reviewed IS
  'Admin has verified the breed encyclopedia image is correct';

-- Public breed-images bucket (mirrors breeder-photos)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('breed-images', 'breed-images', true, 2097152, ARRAY['image/jpeg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "breed_images_public_read" ON storage.objects;
CREATE POLICY "breed_images_public_read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'breed-images');

DROP POLICY IF EXISTS "breed_images_service_insert" ON storage.objects;
CREATE POLICY "breed_images_service_insert"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'breed-images' AND auth.role() = 'service_role');

DROP POLICY IF EXISTS "breed_images_service_update" ON storage.objects;
CREATE POLICY "breed_images_service_update"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'breed-images' AND auth.role() = 'service_role');

DROP POLICY IF EXISTS "breed_images_service_delete" ON storage.objects;
CREATE POLICY "breed_images_service_delete"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'breed-images' AND auth.role() = 'service_role');

-- Newsletter campaigns (admin-composed broadcasts)
CREATE TABLE IF NOT EXISTS public.newsletter_campaigns (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  subject text NOT NULL,
  preview_text text,
  html_body text NOT NULL,
  text_body text,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'scheduled')),
  recipient_count integer DEFAULT 0,
  sent_at timestamptz,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.newsletter_campaigns ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "newsletter_campaigns_service" ON public.newsletter_campaigns;
CREATE POLICY "newsletter_campaigns_service"
  ON public.newsletter_campaigns FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
