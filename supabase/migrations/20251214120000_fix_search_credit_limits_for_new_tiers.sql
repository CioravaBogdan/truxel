-- Align server-side search credit calculations with Truxel tier limits.
-- Trial: 5, Standard: 30, Fleet Manager: 30, Pro: 50, Pro Freighter: 50.

CREATE OR REPLACE FUNCTION public.get_total_search_credits(p_user_id uuid)
 RETURNS TABLE(purchased_credits integer, subscription_searches_remaining integer, total_available integer)
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  v_purchased_credits int;
  v_subscription_remaining int;
  v_profile profiles%ROWTYPE;
BEGIN
  -- Get purchased credits that haven't expired
  SELECT COALESCE(SUM(credits_remaining), 0) INTO v_purchased_credits
  FROM user_search_credits
  WHERE user_id = p_user_id
    AND credits_remaining > 0
    AND (expires_at IS NULL OR expires_at > now());

  -- Get profile info
  SELECT * INTO v_profile
  FROM profiles
  WHERE user_id = p_user_id;

  -- Calculate subscription searches remaining
  IF v_profile.subscription_tier = 'trial' THEN
    v_subscription_remaining := GREATEST(0, 5 - COALESCE(v_profile.trial_searches_used, 0));
  ELSIF v_profile.subscription_tier = 'standard' THEN
    v_subscription_remaining := GREATEST(0, 30 - COALESCE(v_profile.monthly_searches_used, 0));
  ELSIF v_profile.subscription_tier = 'fleet_manager' THEN
    v_subscription_remaining := GREATEST(0, 30 - COALESCE(v_profile.monthly_searches_used, 0));
  ELSIF v_profile.subscription_tier = 'pro' THEN
    v_subscription_remaining := GREATEST(0, 50 - COALESCE(v_profile.monthly_searches_used, 0));
  ELSIF v_profile.subscription_tier = 'pro_freighter' THEN
    v_subscription_remaining := GREATEST(0, 50 - COALESCE(v_profile.monthly_searches_used, 0));
  ELSIF v_profile.subscription_tier = 'premium' THEN
    v_subscription_remaining := GREATEST(0, 100 - COALESCE(v_profile.monthly_searches_used, 0));
  ELSE
    v_subscription_remaining := 0;
  END IF;

  RETURN QUERY
    SELECT
      v_purchased_credits,
      v_subscription_remaining,
      v_purchased_credits + v_subscription_remaining;
END;
$function$;


CREATE OR REPLACE FUNCTION public.consume_search_credit(p_user_id uuid)
 RETURNS TABLE(success boolean, credit_source text, remaining_purchased integer, remaining_subscription integer)
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  v_credit_record user_search_credits%ROWTYPE;
  v_profile profiles%ROWTYPE;
  v_tier_limits jsonb := '{"trial": 5, "standard": 30, "fleet_manager": 30, "pro": 50, "pro_freighter": 50, "premium": 100}'::jsonb;
BEGIN
  -- Try to consume from purchased credits first (oldest first, FIFO)
  SELECT * INTO v_credit_record
  FROM user_search_credits
  WHERE user_id = p_user_id
    AND credits_remaining > 0
    AND (expires_at IS NULL OR expires_at > now())
  ORDER BY created_at ASC
  LIMIT 1
  FOR UPDATE;

  IF FOUND THEN
    -- Consume from purchased credits
    UPDATE user_search_credits
    SET credits_remaining = credits_remaining - 1
    WHERE id = v_credit_record.id;

    -- Get remaining counts
    DECLARE
      v_credits_result RECORD;
    BEGIN
      SELECT * INTO v_credits_result FROM get_total_search_credits(p_user_id);

      RETURN QUERY
        SELECT
          true,
          'purchased'::text,
          v_credits_result.purchased_credits,
          v_credits_result.subscription_searches_remaining;
    END;
  ELSE
    -- No purchased credits, try subscription credits
    SELECT * INTO v_profile
    FROM profiles
    WHERE user_id = p_user_id
    FOR UPDATE;

    IF v_profile.subscription_tier = 'trial' THEN
      IF COALESCE(v_profile.trial_searches_used, 0) < 5 THEN
        UPDATE profiles
        SET trial_searches_used = COALESCE(trial_searches_used, 0) + 1
        WHERE user_id = p_user_id;

        DECLARE v_credits_result RECORD;
        BEGIN
          SELECT * INTO v_credits_result FROM get_total_search_credits(p_user_id);

          RETURN QUERY
            SELECT
              true,
              'subscription'::text,
              v_credits_result.purchased_credits,
              v_credits_result.subscription_searches_remaining;
        END;
      ELSE
        RETURN QUERY SELECT false, 'none'::text, 0, 0;
      END IF;
    ELSE
      -- Subscription tiers with monthly usage
      DECLARE
        v_limit int;
      BEGIN
        v_limit := COALESCE((v_tier_limits->>v_profile.subscription_tier)::int, 0);

        IF COALESCE(v_profile.monthly_searches_used, 0) < v_limit THEN
          UPDATE profiles
          SET monthly_searches_used = COALESCE(monthly_searches_used, 0) + 1
          WHERE user_id = p_user_id;

          DECLARE v_credits_result RECORD;
          BEGIN
            SELECT * INTO v_credits_result FROM get_total_search_credits(p_user_id);

            RETURN QUERY
              SELECT
                true,
                'subscription'::text,
                v_credits_result.purchased_credits,
                v_credits_result.subscription_searches_remaining;
          END;
        ELSE
          RETURN QUERY SELECT false, 'none'::text, 0, 0;
        END IF;
      END;
    END IF;
  END IF;
END;
$function$;
