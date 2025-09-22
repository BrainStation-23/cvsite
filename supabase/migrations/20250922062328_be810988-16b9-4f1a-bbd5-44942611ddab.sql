-- Create RPC functions to fetch cron job data safely

-- Function to get cron job executions from cron.job_run_details
CREATE OR REPLACE FUNCTION public.get_cron_job_executions()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result json;
BEGIN
  -- Check if the cron extension is available and the table exists
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'cron' AND table_name = 'job_run_details'
  ) THEN
    -- Query the cron execution history
    SELECT json_agg(
      json_build_object(
        'jobid', jobid,
        'runid', runid,
        'job_pid', job_pid,
        'database', database,
        'username', username,
        'command', command,
        'status', status,
        'return_message', return_message,
        'start_time', start_time,
        'end_time', end_time
      )
    ) INTO result
    FROM cron.job_run_details
    ORDER BY start_time DESC
    LIMIT 100;
    
    RETURN COALESCE(result, '[]'::json);
  ELSE
    -- Return empty array if cron extension is not available
    RETURN '[]'::json;
  END IF;
EXCEPTION
  WHEN OTHERS THEN
    -- Return empty array on any error
    RETURN '[]'::json;
END;
$$;

-- Function to get active cron jobs from cron.job
CREATE OR REPLACE FUNCTION public.get_active_cron_jobs()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result json;
BEGIN
  -- Check if the cron extension is available and the table exists
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'cron' AND table_name = 'job'
  ) THEN
    -- Query the active cron jobs
    SELECT json_agg(
      json_build_object(
        'jobid', jobid,
        'schedule', schedule,
        'command', command,
        'nodename', nodename,
        'nodeport', nodeport,
        'database', database,
        'username', username,
        'active', active,
        'jobname', jobname
      )
    ) INTO result
    FROM cron.job
    WHERE active = true;
    
    RETURN COALESCE(result, '[]'::json);
  ELSE
    -- Return empty array if cron extension is not available
    RETURN '[]'::json;
  END IF;
EXCEPTION
  WHEN OTHERS THEN
    -- Return empty array on any error
    RETURN '[]'::json;
END;
$$;

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION public.get_cron_job_executions() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_active_cron_jobs() TO authenticated;