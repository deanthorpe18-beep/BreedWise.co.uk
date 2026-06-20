-- Editable receipt templates (breeder defaults + per-pup saved drafts)

ALTER TABLE public.breeders
  ADD COLUMN IF NOT EXISTS receipt_settings jsonb NOT NULL DEFAULT '{}'::jsonb;

ALTER TABLE public.breeding_litter_animals
  ADD COLUMN IF NOT EXISTS receipt_drafts jsonb NOT NULL DEFAULT '{}'::jsonb;

COMMENT ON COLUMN public.breeders.receipt_settings IS 'Default deposit/final receipt templates for the breeding portal';
COMMENT ON COLUMN public.breeding_litter_animals.receipt_drafts IS 'Saved edited receipt drafts per pup (deposit/final keys)';
