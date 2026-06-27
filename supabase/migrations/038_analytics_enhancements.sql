-- Outreach email engagement (Resend webhooks)
ALTER TABLE outreach_sends
  ADD COLUMN IF NOT EXISTS resend_id TEXT,
  ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS first_opened_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS last_opened_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS open_count INT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS first_clicked_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS last_clicked_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS click_count INT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS site_visited_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS claimed_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_outreach_sends_resend_id ON outreach_sends (resend_id) WHERE resend_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_outreach_sends_engagement ON outreach_sends (sent_at DESC) WHERE status = 'sent';

-- Visitor session journeys (organic reach)
CREATE TABLE IF NOT EXISTS visitor_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL UNIQUE,
  ip_hash TEXT,
  user_agent TEXT,
  entry_path TEXT,
  referrer TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_active_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  total_duration_seconds INT NOT NULL DEFAULT 0,
  page_count INT NOT NULL DEFAULT 0,
  click_count INT NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_visitor_sessions_started ON visitor_sessions (started_at DESC);
CREATE INDEX IF NOT EXISTS idx_visitor_sessions_ip ON visitor_sessions (ip_hash, started_at DESC);

-- Per-page duration and session linkage
ALTER TABLE page_views
  ADD COLUMN IF NOT EXISTS session_id TEXT,
  ADD COLUMN IF NOT EXISTS duration_seconds INT;

CREATE INDEX IF NOT EXISTS idx_page_views_session ON page_views (session_id, created_at DESC);

-- Click and interaction events within a session
CREATE TABLE IF NOT EXISTS visitor_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL,
  event_type TEXT NOT NULL CHECK (event_type IN ('click', 'cta', 'scroll_depth')),
  page_path TEXT,
  element_text TEXT,
  element_href TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_visitor_events_session ON visitor_events (session_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_visitor_events_type ON visitor_events (event_type, created_at DESC);

-- RLS: service role only (same pattern as other analytics tables)
ALTER TABLE visitor_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE visitor_events ENABLE ROW LEVEL SECURITY;
