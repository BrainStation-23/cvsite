
-- Create the reset_weekly_validation function
CREATE OR REPLACE FUNCTION reset_weekly_validation()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE resource_planning 
  SET weekly_validation = false 
  WHERE weekly_validation = true;
  
  RAISE LOG 'Weekly validation reset completed. Updated % records.', 
    (SELECT COUNT(*) FROM resource_planning WHERE weekly_validation = false);
END;
$$;

-- Enable pg_cron extension if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Create a table to store cron job configurations
CREATE TABLE IF NOT EXISTS cron_job_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_name TEXT UNIQUE NOT NULL,
  schedule TEXT NOT NULL,
  function_name TEXT NOT NULL,
  is_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on the cron_job_configs table
ALTER TABLE cron_job_configs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for cron_job_configs
CREATE POLICY "Only admins can manage cron job configs" 
  ON cron_job_configs 
  FOR ALL 
  USING (is_admin()) 
  WITH CHECK (is_admin());

-- Create function to manage weekly validation cron job
CREATE OR REPLACE FUNCTION manage_weekly_validation_cron(
  p_schedule TEXT DEFAULT '0 0 * * 1', -- Default: Every Monday at midnight
  p_enabled BOOLEAN DEFAULT true
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  job_id BIGINT;
  config_exists BOOLEAN;
  result JSON;
BEGIN
  -- Check if user is admin
  IF NOT is_admin() THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Unauthorized: Admin access required'
    );
  END IF;

  -- Check if configuration exists
  SELECT EXISTS(
    SELECT 1 FROM cron_job_configs 
    WHERE job_name = 'weekly_validation_reset'
  ) INTO config_exists;

  -- Remove existing cron job if it exists
  SELECT cron.unschedule('weekly_validation_reset') INTO job_id;

  IF p_enabled THEN
    -- Create/update the cron job
    SELECT cron.schedule(
      'weekly_validation_reset',
      p_schedule,
      'SELECT reset_weekly_validation();'
    ) INTO job_id;
  END IF;

  -- Insert or update the configuration
  INSERT INTO cron_job_configs (job_name, schedule, function_name, is_enabled)
  VALUES ('weekly_validation_reset', p_schedule, 'reset_weekly_validation', p_enabled)
  ON CONFLICT (job_name) 
  DO UPDATE SET 
    schedule = EXCLUDED.schedule,
    is_enabled = EXCLUDED.is_enabled,
    updated_at = NOW();

  -- Return success response
  result := json_build_object(
    'success', true,
    'job_id', COALESCE(job_id, 0),
    'schedule', p_schedule,
    'enabled', p_enabled,
    'message', CASE 
      WHEN p_enabled THEN 'Weekly validation cron job scheduled successfully'
      ELSE 'Weekly validation cron job disabled successfully'
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

-- Create function to get current cron job configuration
CREATE OR REPLACE FUNCTION get_weekly_validation_cron_config()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  config_record RECORD;
  result JSON;
BEGIN
  -- Check if user is admin
  IF NOT is_admin() THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Unauthorized: Admin access required'
    );
  END IF;

  -- Get current configuration
  SELECT * INTO config_record
  FROM cron_job_configs 
  WHERE job_name = 'weekly_validation_reset';

  IF FOUND THEN
    result := json_build_object(
      'success', true,
      'config', json_build_object(
        'schedule', config_record.schedule,
        'is_enabled', config_record.is_enabled,
        'created_at', config_record.created_at,
        'updated_at', config_record.updated_at
      )
    );
  ELSE
    result := json_build_object(
      'success', true,
      'config', json_build_object(
        'schedule', '0 0 * * 1',
        'is_enabled', false,
        'created_at', null,
        'updated_at', null
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
