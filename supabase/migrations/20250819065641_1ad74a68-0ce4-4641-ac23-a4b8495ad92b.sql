
-- Function to get the current weekly score card cron configuration
CREATE OR REPLACE FUNCTION public.get_weekly_score_card_cron_config()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  config_record RECORD;
  result JSON;
BEGIN
  -- Get the weekly score card cron job configuration
  SELECT schedule, is_enabled, created_at, updated_at
  INTO config_record
  FROM public.cron_job_configs
  WHERE job_name = 'weekly_score_card_calculation'
  LIMIT 1;
  
  IF config_record IS NULL THEN
    -- Return default configuration if none exists
    result := json_build_object(
      'success', true,
      'config', json_build_object(
        'schedule', '0 0 * * 1',
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
END;
$$;

-- Function to manage (create/update) the weekly score card cron job configuration
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
BEGIN
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
  
  -- Return success response
  result := json_build_object(
    'success', true,
    'message', CASE 
      WHEN p_enabled THEN 'Weekly score card cron job enabled successfully'
      ELSE 'Weekly score card cron job disabled successfully'
    END
  );
  
  RETURN result;
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$;
