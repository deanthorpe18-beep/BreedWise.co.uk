-- Track outreach emails sent to breeders to enforce a 3-month cooldown
CREATE TABLE IF NOT EXISTS outreach_sends (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  breeder_slug TEXT NOT NULL REFERENCES breeders(slug) ON DELETE CASCADE,
  to_email TEXT NOT NULL,
  sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  status TEXT NOT NULL DEFAULT 'sent' CHECK (status IN ('sent', 'failed', 'skipped')),
  reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for fast cooldown lookups
CREATE INDEX IF NOT EXISTS idx_outreach_sends_breeder_slug ON outreach_sends(breeder_slug);
CREATE INDEX IF NOT EXISTS idx_outreach_sends_sent_at ON outreach_sends(sent_at DESC);

-- Composite index for checking recent sends per breeder
CREATE INDEX IF NOT EXISTS idx_outreach_sends_breeder_sent ON outreach_sends(breeder_slug, sent_at DESC);
