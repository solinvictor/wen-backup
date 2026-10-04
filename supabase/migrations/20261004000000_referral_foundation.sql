-- Referral foundation
-- 1. Add unique referral_code to buyers (generated on insert)
-- 2. Create referrals table to track who referred who

-- Unique 8-char referral code for each buyer
ALTER TABLE buyers
  ADD COLUMN IF NOT EXISTS referral_code text UNIQUE;

-- Auto-generate a code for every new buyer
CREATE OR REPLACE FUNCTION generate_referral_code()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.referral_code IS NULL THEN
    NEW.referral_code := upper(substring(replace(gen_random_uuid()::text, '-', '') FROM 1 FOR 8));
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_generate_referral_code ON buyers;
CREATE TRIGGER trg_generate_referral_code
  BEFORE INSERT ON buyers
  FOR EACH ROW EXECUTE FUNCTION generate_referral_code();

-- Backfill existing buyers with a code
UPDATE buyers
SET referral_code = upper(substring(replace(gen_random_uuid()::text, '-', '') FROM 1 FOR 8))
WHERE referral_code IS NULL;

-- Referrals table
CREATE TABLE IF NOT EXISTS referrals (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id   uuid NOT NULL REFERENCES buyers(id) ON DELETE CASCADE,
  referred_id   uuid REFERENCES buyers(id) ON DELETE SET NULL,
  order_id      uuid REFERENCES orders(id) ON DELETE SET NULL,
  code_used     text NOT NULL,
  status        text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'converted')),
  created_at    timestamptz NOT NULL DEFAULT now(),
  converted_at  timestamptz
);

-- RLS
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;

-- Users can see referrals they initiated
CREATE POLICY "referrer can view own referrals"
  ON referrals FOR SELECT
  USING (
    referrer_id IN (
      SELECT id FROM buyers WHERE user_id = auth.uid()
    )
  );
