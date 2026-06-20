-- Allow search_impression action type for breeder analytics

ALTER TABLE public.cta_clicks DROP CONSTRAINT IF EXISTS cta_clicks_action_type_check;

ALTER TABLE public.cta_clicks ADD CONSTRAINT cta_clicks_action_type_check
  CHECK (action_type IN ('call', 'website', 'save', 'claim', 'email', 'directions', 'search_impression'));
