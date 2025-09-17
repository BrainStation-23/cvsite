-- Create RPC function to get non-billed sync cron configuration
CREATE OR REPLACE FUNCTION public.get_non_billed_sync_cron_config()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  config_record RECORD;
  result json;
BEGIN
  -- Check if user is admin
  IF NOT is_admin() THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Unauthorized: Admin access required'
    );
  END IF;

  -- Get the cron job configuration for non-billed sync
  SELECT schedule, is_enabled, created_at, updated_at
  INTO config_record
  FROM cron_job_configs
  WHERE job_name = 'non_billed_sync'
    AND function_name = 'sync_non_billed_resources_now'
  ORDER BY created_at DESC
  LIMIT 1;

  IF config_record IS NULL THEN
    -- No configuration exists yet
    result := jsonb_build_object(
      'success', true,
      'config', null,
      'message', 'No non-billed sync cron configuration found'
    );
  ELSE
    -- Return the existing configuration
    result := jsonb_build_object(
      'success', true,
      'config', jsonb_build_object(
        'schedule', config_record.schedule,
        'is_enabled', config_record.is_enabled,
        'created_at', config_record.created_at,
        'updated_at', config_record.updated_at
      ),
      'message', 'Non-billed sync cron configuration retrieved successfully'
    );
  END IF;

  RETURN result;
END;
$$;

-- Create RPC function to manage non-billed sync cron job
CREATE OR REPLACE FUNCTION public.manage_non_billed_sync_cron(
  p_schedule text,
  p_enabled boolean
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  job_name_val text := 'non_billed_sync';
  job_id text;
  existing_config RECORD;
  result json;
BEGIN
  -- Check if user is admin
  IF NOT is_admin() THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Unauthorized: Admin access required'
    );
  END IF;

  -- Validate schedule format (basic cron validation)
  IF p_schedule IS NULL OR trim(p_schedule) = '' THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Schedule cannot be empty'
    );
  END IF;

  -- Check if configuration already exists
  SELECT * INTO existing_config
  FROM cron_job_configs
  WHERE job_name = job_name_val
    AND function_name = 'sync_non_billed_resources_now'
  ORDER BY created_at DESC
  LIMIT 1;

  BEGIN
    -- Remove any existing cron job with this name
    PERFORM cron.unschedule(job_name_val);
  EXCEPTION
    WHEN OTHERS THEN
      -- Ignore errors if job doesn't exist
      NULL;
  END;

  -- Create new cron job if enabled
  IF p_enabled THEN
    SELECT cron.schedule(
      job_name_val,
      p_schedule,
      $cron$
      SELECT net.http_post(
        url := 'https://pvkzzkbwjntazemosbot.supabase.co/functions/v1/sync-non-billed-resources',
        headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB2a3p6a2J3am50YXplbW9zYm90Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc4MjA3NzAsImV4cCI6MjA2MzM5Njc3MH0.fdlhAHGzYtW_z_j4sgD5V5-viOnbeGlhe5kD0NO8zq8"}'::jsonb,
        body := '{"source": "cron"}'::jsonb
      );
      $cron$
    ) INTO job_id;
  END IF;

  -- Insert or update configuration
  IF existing_config IS NULL THEN
    INSERT INTO cron_job_configs (job_name, function_name, schedule, is_enabled)
    VALUES (job_name_val, 'sync_non_billed_resources_now', p_schedule, p_enabled);
  ELSE
    UPDATE cron_job_configs
    SET schedule = p_schedule,
        is_enabled = p_enabled,
        updated_at = now()
    WHERE job_name = job_name_val
      AND function_name = 'sync_non_billed_resources_now';
  END IF;

  -- Build success response
  result := jsonb_build_object(
    'success', true,
    'config', jsonb_build_object(
      'schedule', p_schedule,
      'is_enabled', p_enabled,
      'created_at', COALESCE(existing_config.created_at, now()),
      'updated_at', now()
    ),
    'message', CASE
      WHEN p_enabled THEN 'Non-billed sync cron job enabled successfully'
      ELSE 'Non-billed sync cron job disabled successfully'
    END
  );

  RETURN result;
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Failed to manage non-billed sync cron job: ' || SQLERRM
    );
END;
$$;