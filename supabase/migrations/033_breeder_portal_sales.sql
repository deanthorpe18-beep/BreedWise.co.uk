-- Breeder portal step 2: buyer details, sale checklist, receipt paths

ALTER TABLE public.breeding_litter_animals
  ADD COLUMN IF NOT EXISTS buyer_name text,
  ADD COLUMN IF NOT EXISTS buyer_email text,
  ADD COLUMN IF NOT EXISTS buyer_phone text,
  ADD COLUMN IF NOT EXISTS buyer_address text,
  ADD COLUMN IF NOT EXISTS deposit_received boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS deposit_date date,
  ADD COLUMN IF NOT EXISTS deposit_amount numeric(10, 2),
  ADD COLUMN IF NOT EXISTS deposit_receipt_path text,
  ADD COLUMN IF NOT EXISTS paid_in_full boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS final_payment_date date,
  ADD COLUMN IF NOT EXISTS sale_price numeric(10, 2),
  ADD COLUMN IF NOT EXISTS final_receipt_path text,
  ADD COLUMN IF NOT EXISTS free_food_provided boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS insurance_provided boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS insurance_policy_number text,
  ADD COLUMN IF NOT EXISTS insurance_provider text,
  ADD COLUMN IF NOT EXISTS go_home_date date;

COMMENT ON COLUMN public.breeding_litter_animals.deposit_receipt_path IS 'Storage path in claim-evidence bucket (portal-receipts/)';
COMMENT ON COLUMN public.breeding_litter_animals.final_receipt_path IS 'Storage path in claim-evidence bucket (portal-receipts/)';
