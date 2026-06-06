-- BreedWise Schema Update 003
-- Adds admin audit fields for GDPR compliance and status update tracking.

-- ============================================
-- REMOVALS TABLE: GDPR HARD DELETE AUDIT
-- ============================================
ALTER TABLE public.removals
  ADD COLUMN IF NOT EXISTS hard_deleted_at timestamptz,
  ADD COLUMN IF NOT EXISTS hard_deleted_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS status_update_sent_at timestamptz;

-- ============================================
-- CLAIMS TABLE: STATUS UPDATE TRACKING
-- ============================================
ALTER TABLE public.claims
  ADD COLUMN IF NOT EXISTS status_update_sent_at timestamptz;

-- ============================================
-- INDEXES FOR NEW COLUMNS
-- ============================================
CREATE INDEX IF NOT EXISTS idx_removals_hard_deleted ON public.removals(hard_deleted_at);
