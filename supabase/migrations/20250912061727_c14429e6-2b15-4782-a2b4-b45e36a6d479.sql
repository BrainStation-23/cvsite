-- Create function to update bench feedback
CREATE OR REPLACE FUNCTION public.update_bench_feedback(
  employee_id_param text,
  feedback_param text
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result_json json;
  affected_rows integer;
BEGIN
  -- Update the bench feedback for the specified employee
  UPDATE public.bench 
  SET 
    bench_feedback = feedback_param,
    updated_at = now()
  FROM public.profiles p
  WHERE bench.profile_id = p.id 
    AND p.employee_id = employee_id_param;
  
  GET DIAGNOSTICS affected_rows = ROW_COUNT;
  
  -- If no rows were affected, try to insert a new record
  IF affected_rows = 0 THEN
    -- Get the profile_id from employee_id
    INSERT INTO public.bench (profile_id, bench_feedback, bench_date)
    SELECT p.id, feedback_param, CURRENT_DATE
    FROM public.profiles p
    WHERE p.employee_id = employee_id_param;
    
    GET DIAGNOSTICS affected_rows = ROW_COUNT;
  END IF;
  
  -- Return result
  SELECT json_build_object(
    'success', affected_rows > 0,
    'affected_rows', affected_rows,
    'employee_id', employee_id_param,
    'feedback', feedback_param
  ) INTO result_json;
  
  RETURN result_json;
END;
$$;