-- Track when an outreach email leads to a breeder signup
ALTER TABLE outreach_sends
  ADD COLUMN IF NOT EXISTS converted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS converted_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_outreach_sends_converted
  ON outreach_sends (breeder_slug, converted_at DESC)
  WHERE converted_at IS NOT NULL;
