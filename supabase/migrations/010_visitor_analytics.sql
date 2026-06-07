-- Migration 010: Visitor analytics indexes for fast unique visitor counting

-- Composite index for fast unique visitor queries by date range
CREATE INDEX IF NOT EXISTS idx_page_views_ip_created ON public.page_views(ip_hash, created_at);

-- Index on user_sessions for fast online count
CREATE INDEX IF NOT EXISTS idx_user_sessions_ip_created ON public.user_sessions(ip_hash, created_at);
