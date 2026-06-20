-- Add availability status to breeders for litter/enquiry indicators
ALTER TABLE public.breeders
ADD COLUMN IF NOT EXISTS availability_status TEXT DEFAULT 'available'
CHECK (availability_status IN ('available', 'waitlist', 'not_available', 'paused'));

-- Index for filtering by availability
CREATE INDEX IF NOT EXISTS idx_breeders_availability_status
ON public.breeders(availability_status)
WHERE availability_status = 'available';

COMMENT ON COLUMN public.breeders.availability_status IS
  'Breeder current availability: available, waitlist, not_available, paused';
