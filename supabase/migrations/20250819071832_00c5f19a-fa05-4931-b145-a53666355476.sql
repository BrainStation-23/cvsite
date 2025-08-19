
-- Fix the manage_weekly_score_card_cron function to properly handle cron job removal
CREATE OR REPLACE FUNCTION public.manage_weekly_score_card_cron(
  p_schedule TEXT,
  p_enabled BOOLEAN
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  config_id UUID;
  result JSON;
  job_id BIGINT;
BEGIN
  -- Check if user is admin
  IF NOT public.is_admin() THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Insufficient permissions. Admin role required.'
    );
  END IF;

  -- Check if configuration already exists
  SELECT id INTO config_id
  FROM public.cron_job_configs
  WHERE job_name = 'weekly_score_card_calculation'
  LIMIT 1;
  
  IF config_id IS NULL THEN
    -- Insert new configuration
    INSERT INTO public.cron_job_configs (job_name, schedule, function_name, is_enabled)
    VALUES ('weekly_score_card_calculation', p_schedule, 'calculate_weekly_score_card', p_enabled)
    RETURNING id INTO config_id;
  ELSE
    -- Update existing configuration
    UPDATE public.cron_job_configs
    SET 
      schedule = p_schedule,
      is_enabled = p_enabled,
      updated_at = NOW()
    WHERE id = config_id;
  END IF;
  
  -- Handle the actual cron job
  IF p_enabled THEN
    -- Remove existing cron job if it exists (ignore errors)
    BEGIN
      SELECT cron.unschedule('weekly_score_card_calculation') INTO job_id;
    EXCEPTION
      WHEN OTHERS THEN
        -- Job might not exist, continue
        NULL;
    END;
    
    -- Create new cron job
    SELECT cron.schedule(
      'weekly_score_card_calculation',
      p_schedule,
      'SELECT public.calculate_weekly_score_card();'
    ) INTO job_id;
    
    -- Return success response with job_id
    result := json_build_object(
      'success', true,
      'message', 'Weekly score card cron job enabled and scheduled successfully',
      'job_id', job_id
    );
  ELSE
    -- Disable the cron job by unscheduling it
    BEGIN
      SELECT cron.unschedule('weekly_score_card_calculation') INTO job_id;
      
      result := json_build_object(
        'success', true,
        'message', 'Weekly score card cron job disabled and unscheduled successfully',
        'job_id', job_id
      );
    EXCEPTION
      WHEN OTHERS THEN
        -- Job might not exist, but still mark as successful
        result := json_build_object(
          'success', true,
          'message', 'Weekly score card cron job disabled (job was not scheduled)',
          'job_id', null
        );
    END;
  END IF;
  
  RETURN result;
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$;

-- Also update the get function to include admin check
CREATE OR REPLACE FUNCTION public.get_weekly_score_card_cron_config()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  config_record RECORD;
  result JSON;
BEGIN
  -- Check if user is admin
  IF NOT public.is_admin() THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Insufficient permissions. Admin role required.'
    );
  END IF;

  -- Get the configuration
  SELECT * INTO config_record
  FROM public.cron_job_configs
  WHERE job_name = 'weekly_score_card_calculation'
  LIMIT 1;

  IF config_record IS NULL THEN
    -- Return default configuration
    result := json_build_object(
      'success', true,
      'config', json_build_object(
        'schedule', '0 9 * * 1',
        'is_enabled', false,
        'created_at', null,
        'updated_at', null
      )
    );
  ELSE
    result := json_build_object(
      'success', true,
      'config', json_build_object(
        'schedule', config_record.schedule,
        'is_enabled', config_record.is_enabled,
        'created_at', config_record.created_at,
        'updated_at', config_record.updated_at
      )
    );
  END IF;

  RETURN result;
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$;
