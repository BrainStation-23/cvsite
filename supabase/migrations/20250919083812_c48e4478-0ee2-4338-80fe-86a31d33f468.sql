-- Create RPC function to duplicate resource assignments
CREATE OR REPLACE FUNCTION duplicate_resource_assignment(assignment_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  original_assignment record;
  next_month_start date;
  next_month_end date;
  check_month date;
  available_month_found boolean := false;
  new_assignment_id uuid;
  result_data json;
BEGIN
  -- Get the original assignment
  SELECT * INTO original_assignment
  FROM resource_planning
  WHERE id = assignment_id;
  
  -- Check if assignment exists
  IF NOT FOUND THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Assignment not found'
    );
  END IF;
  
  -- Start checking from the month after the original assignment's start date
  check_month := date_trunc('month', COALESCE(original_assignment.engagement_start_date, CURRENT_DATE)) + interval '1 month';
  
  -- Find the next available month (check up to 24 months ahead)
  FOR i IN 1..24 LOOP
    -- Check if this month has any conflicting assignments for the same profile
    IF NOT EXISTS (
      SELECT 1 
      FROM resource_planning rp
      WHERE rp.profile_id = original_assignment.profile_id
        AND rp.engagement_complete = false
        AND (
          (rp.engagement_start_date <= (check_month + interval '1 month' - interval '1 day'))
          AND 
          (COALESCE(rp.release_date, rp.engagement_start_date + interval '1 month') >= check_month)
        )
    ) THEN
      -- Found an available month
      next_month_start := check_month;
      next_month_end := check_month + interval '1 month' - interval '1 day';
      available_month_found := true;
      EXIT;
    END IF;
    
    -- Move to next month
    check_month := check_month + interval '1 month';
  END LOOP;
  
  -- If no available month found
  IF NOT available_month_found THEN
    RETURN json_build_object(
      'success', false,
      'error', 'No available months found for the next 24 months'
    );
  END IF;
  
  -- Generate new UUID
  new_assignment_id := gen_random_uuid();
  
  -- Create the new forecasted assignment
  INSERT INTO resource_planning (
    id,
    profile_id,
    project_id,
    bill_type_id,
    engagement_percentage,
    billing_percentage,
    engagement_start_date,
    release_date,
    engagement_complete,
    weekly_validation,
    is_forecasted
  ) VALUES (
    new_assignment_id,
    original_assignment.profile_id,
    original_assignment.project_id,
    original_assignment.bill_type_id,
    original_assignment.engagement_percentage,
    original_assignment.billing_percentage,
    next_month_start,
    next_month_end,
    false,
    false,
    true
  );
  
  -- Get the created assignment with related data for return
  SELECT json_build_object(
    'success', true,
    'new_assignment_id', new_assignment_id,
    'start_date', next_month_start,
    'end_date', next_month_end,
    'message', 'Assignment duplicated successfully'
  ) INTO result_data;
  
  RETURN result_data;
  
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$;