-- Update the bulk_update_resource_planning RPC function to fix field name mismatches
CREATE OR REPLACE FUNCTION public.bulk_update_resource_planning(users_data jsonb)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  update_record jsonb;
  resource_record record;
  successful_updates integer := 0;
  failed_updates integer := 0;
  total_processed integer := 0;
  error_messages json[] := '{}';
  result_json json;
BEGIN
  -- Loop through each record in the input data
  FOR update_record IN SELECT * FROM jsonb_array_elements(users_data)
  LOOP
    total_processed := total_processed + 1;
    
    BEGIN
      -- Check if we have resource_planning_id for direct lookup
      IF update_record ? 'resource_planning_id' THEN
        -- Direct update by resource planning ID
        UPDATE resource_planning 
        SET release_date = COALESCE((update_record->>'release_date')::date, release_date),
            engagement_percentage = COALESCE((update_record->>'engagement_percentage')::numeric, engagement_percentage),
            billing_percentage = COALESCE((update_record->>'billing_percentage')::numeric, billing_percentage),
            updated_at = now()
        WHERE id = (update_record->>'resource_planning_id')::uuid;
        
        IF NOT FOUND THEN
          error_messages := error_messages || json_build_object(
            'row', total_processed,
            'error', 'Resource planning record not found with ID: ' || (update_record->>'resource_planning_id'),
            'data', update_record
          );
          failed_updates := failed_updates + 1;
          CONTINUE;
        END IF;
      ELSE
        -- Fallback: lookup by employee_id and project_name
        SELECT rp.* INTO resource_record
        FROM resource_planning rp
        JOIN profiles p ON rp.profile_id = p.id
        JOIN projects proj ON rp.project_id = proj.id
        WHERE p.employee_id = (update_record->>'employee_id')
        AND proj.name = (update_record->>'project_name')
        LIMIT 1;
        
        IF resource_record IS NULL THEN
          error_messages := error_messages || json_build_object(
            'row', total_processed,
            'error', 'No resource planning record found for employee ' || (update_record->>'employee_id') || ' and project ' || (update_record->>'project_name'),
            'data', update_record
          );
          failed_updates := failed_updates + 1;
          CONTINUE;
        END IF;
        
        -- Update the found record
        UPDATE resource_planning 
        SET release_date = COALESCE((update_record->>'release_date')::date, release_date),
            engagement_percentage = COALESCE((update_record->>'engagement_percentage')::numeric, engagement_percentage),
            billing_percentage = COALESCE((update_record->>'billing_percentage')::numeric, billing_percentage),
            updated_at = now()
        WHERE id = resource_record.id;
      END IF;
      
      successful_updates := successful_updates + 1;
      
    EXCEPTION
      WHEN OTHERS THEN
        error_messages := error_messages || json_build_object(
          'row', total_processed,
          'error', SQLERRM,
          'data', update_record
        );
        failed_updates := failed_updates + 1;
    END;
  END LOOP;
  
  -- Return results with corrected field names
  result_json := json_build_object(
    'total_processed', total_processed,
    'successful_updates', successful_updates,
    'failed_updates', failed_updates,
    'errors', array_to_json(error_messages)
  );
  
  RETURN result_json;
END;
$$;