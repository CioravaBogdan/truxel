-- Fix Influencer System Schema and Logic

-- 1. Add missing Foreign Key to promo_code_redemptions
DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'promo_code_redemptions_promo_code_fkey') THEN 
    ALTER TABLE public.promo_code_redemptions 
    ADD CONSTRAINT promo_code_redemptions_promo_code_fkey 
    FOREIGN KEY (promo_code) REFERENCES public.promo_codes(code); 
  END IF; 
END $$;

-- 2. Create the redeem_promo_code RPC function
-- Note: Using 'offering_id' and 'active' to match existing table structure
create or replace function redeem_promo_code(code_input text)
returns json
language plpgsql
security definer
as $$
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

  -- 5. Return Offering ID
  return json_build_object(
    'valid', true, 
    'offering_id', promo_record.offering_id,
    'description', promo_record.description
  );
end;
$$;
