-- CMS content table for the admin site editor
CREATE TABLE IF NOT EXISTS public.cms_content (
  key text PRIMARY KEY,
  value text NOT NULL DEFAULT '',
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.cms_content ENABLE ROW LEVEL SECURITY;

-- Only admins can read/write CMS content
DROP POLICY IF EXISTS "CMS: admins read" ON public.cms_content;
CREATE POLICY "CMS: admins read"
  ON public.cms_content FOR SELECT
  USING (public.is_admin());

DROP POLICY IF EXISTS "CMS: admins write" ON public.cms_content;
CREATE POLICY "CMS: admins write"
  ON public.cms_content FOR ALL
  USING (public.is_admin());

-- Insert default content
INSERT INTO public.cms_content (key, value) VALUES
  ('hero_title', 'Find your perfect companion'),
  ('hero_subtitle', 'Compare dog breeder listings across the UK. Read reviews, filter by breed and location, and find the right breeder for your family.'),
  ('hero_cta_primary', 'Search breeders'),
  ('hero_cta_secondary', 'Buyer guides'),
  ('trust_banner_text', 'BreedWise is a directory only. We do not sell puppies or endorse breeders.'),
  ('contact_email', 'help@breedwise.co.uk')
ON CONFLICT (key) DO NOTHING;

-- Ensure is_admin() function exists (for RLS policies)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role IN ('admin', 'super_admin')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
