-- 1. Update redeem_promo_code to return stripe_coupon_id
CREATE OR REPLACE FUNCTION public.redeem_promo_code(code_input text)
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
declare
  promo_record record;
begin
  -- 1. Find Code
  select * into promo_record from public.promo_codes where code = code_input;
  
  -- 2. Validate
  if promo_record is null then
    return json_build_object('valid', false, 'message', 'Invalid code');
  end if;
  
  if promo_record.active = false then
    return json_build_object('valid', false, 'message', 'Code expired');
  end if;

  if promo_record.usage_limit is not null and promo_record.times_redeemed >= promo_record.usage_limit then
     return json_build_object('valid', false, 'message', 'Usage limit reached');
  end if;

  -- 3. Log Redemption (Attempt)
  insert into public.promo_code_redemptions (promo_code, user_id)
  values (code_input, auth.uid());

  -- 4. Increment Counter
  update public.promo_codes set times_redeemed = times_redeemed + 1 where code = code_input;

  -- 5. Return Offering ID AND Coupon ID
  return json_build_object(
    'valid', true, 
    'offering_id', promo_record.offering_id,
    'description', promo_record.description,
    'stripe_coupon_id', promo_record.stripe_coupon_id
  );
end;
$function$;

-- 2. Create Trigger Function to auto-assign coupon
CREATE OR REPLACE FUNCTION public.set_default_influencer_coupon()
RETURNS TRIGGER AS $$
BEGIN
    -- If it's linked to an influencer and has no coupon, assign the default one
    IF NEW.influencer_id IS NOT NULL AND NEW.stripe_coupon_id IS NULL THEN
        NEW.stripe_coupon_id := 'INFLUENCER_3MONTHS';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. Create Trigger
DROP TRIGGER IF EXISTS trigger_set_influencer_coupon ON public.promo_codes;
CREATE TRIGGER trigger_set_influencer_coupon
BEFORE INSERT ON public.promo_codes
FOR EACH ROW
EXECUTE FUNCTION public.set_default_influencer_coupon();

-- 4. Backfill existing influencer codes
UPDATE public.promo_codes
SET stripe_coupon_id = 'INFLUENCER_3MONTHS'
WHERE influencer_id IS NOT NULL AND stripe_coupon_id IS NULL;
