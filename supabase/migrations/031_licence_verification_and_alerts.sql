-- Council licence verification + saved search animal type + share CTA

ALTER TABLE public.breeders
  ADD COLUMN IF NOT EXISTS licence_verified boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS licence_document_path text,
  ADD COLUMN IF NOT EXISTS licence_verification_status text DEFAULT 'none'
    CHECK (licence_verification_status IN ('none', 'pending', 'approved', 'rejected'));

COMMENT ON COLUMN public.breeders.licence_verified IS 'Admin verified council breeding licence document';
COMMENT ON COLUMN public.breeders.licence_document_path IS 'Storage path in claim-evidence bucket';
COMMENT ON COLUMN public.breeders.licence_verification_status IS 'Licence document review workflow status';

CREATE INDEX IF NOT EXISTS idx_breeders_licence_pending
  ON public.breeders(licence_verification_status)
  WHERE licence_verification_status = 'pending';

ALTER TABLE public.saved_searches
  ADD COLUMN IF NOT EXISTS animal text;

ALTER TABLE public.cta_clicks DROP CONSTRAINT IF EXISTS cta_clicks_action_type_check;
ALTER TABLE public.cta_clicks ADD CONSTRAINT cta_clicks_action_type_check
  CHECK (action_type IN ('call', 'website', 'save', 'claim', 'email', 'directions', 'search_impression', 'share'));
