
-- First, let's create the function that will actually calculate the weekly score card
CREATE OR REPLACE FUNCTION public.calculate_weekly_score_card()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Log the execution
  INSERT INTO public.system_logs (level, message, created_at)
  VALUES ('info', 'Weekly score card calculation started', NOW());
  
  -- Here you would implement the actual weekly score card calculation logic
  -- For now, we'll just log that it ran
  INSERT INTO public.system_logs (level, message, created_at)
  VALUES ('info', 'Weekly score card calculation completed', NOW());
  
  -- You can add the actual calculation logic here based on your requirements
  -- This might involve calculating utilization rates, updating metrics tables, etc.
END;
$$;

-- Update the manage function to also handle the actual pg_cron jobs
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
  job_name TEXT := 'weekly_score_card_calculation';
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
  
  -- Handle the actual cron job
  IF p_enabled THEN
    -- Remove existing cron job if it exists
    PERFORM cron.unschedule(job_name);
    
    -- Create new cron job
    PERFORM cron.schedule(
      job_name,
      p_schedule,
      'SELECT public.calculate_weekly_score_card();'
    );
  ELSE
    -- Disable the cron job by unscheduling it
    PERFORM cron.unschedule(job_name);
  END IF;
  
  -- Return success response
  result := json_build_object(
    'success', true,
    'message', CASE 
      WHEN p_enabled THEN 'Weekly score card cron job enabled and scheduled successfully'
      ELSE 'Weekly score card cron job disabled and unscheduled successfully'
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

-- Create a system_logs table if it doesn't exist (for logging cron job execution)
CREATE TABLE IF NOT EXISTS public.system_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  level TEXT NOT NULL DEFAULT 'info',
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on system_logs
ALTER TABLE public.system_logs ENABLE ROW LEVEL SECURITY;

-- Create policy for system_logs (only admins can view)
CREATE POLICY "Only admins can view system logs" ON public.system_logs
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);
