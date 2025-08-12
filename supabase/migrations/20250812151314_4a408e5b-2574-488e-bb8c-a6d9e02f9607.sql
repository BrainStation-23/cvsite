
-- Drop the existing function
DROP FUNCTION IF EXISTS public.get_resource_count_statistics(text, text, text, text, text, text);

-- Create a simplified function that handles both cases naturally
CREATE OR REPLACE FUNCTION public.get_resource_count_statistics(
  resource_type_filter text DEFAULT NULL,
  bill_type_filter text DEFAULT NULL,
  expertise_type_filter text DEFAULT NULL,
  sbu_filter text DEFAULT NULL,
  start_date_filter text DEFAULT NULL,
  end_date_filter text DEFAULT NULL
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  result json;
BEGIN
  WITH base_data AS (
    SELECT 
      p.id as profile_id,
      COALESCE(gi.first_name, p.first_name) as first_name,
      COALESCE(gi.last_name, p.last_name) as last_name,
      s.name as sbu_name,
      s.id as sbu_id,
      rt.name as resource_type_name,
      rt.id as resource_type_id,
      bt.name as bill_type_name,
      bt.id as bill_type_id,
      et.name as expertise_type_name,
      et.id as expertise_type_id,
      rp.engagement_percentage,
      rp.billing_percentage,
      rp.engagement_complete,
      rp.engagement_start_date,
      rp.release_date
    FROM profiles p
    LEFT JOIN general_information gi ON p.id = gi.profile_id
    LEFT JOIN sbus s ON p.sbu_id = s.id
    LEFT JOIN resource_types rt ON p.resource_type = rt.id
    LEFT JOIN expertise_types et ON p.expertise = et.id
    LEFT JOIN resource_planning rp ON p.id = rp.profile_id
    LEFT JOIN bill_types bt ON rp.bill_type_id = bt.id
    WHERE TRUE
      AND (resource_type_filter IS NULL OR rt.name ILIKE '%' || resource_type_filter || '%')
      AND (bill_type_filter IS NULL OR bt.name ILIKE '%' || bill_type_filter || '%')
      AND (expertise_type_filter IS NULL OR et.name ILIKE '%' || expertise_type_filter || '%')
      AND (sbu_filter IS NULL OR s.name ILIKE '%' || sbu_filter || '%')
      AND (start_date_filter IS NULL OR rp.engagement_start_date >= start_date_filter::date)
      AND (end_date_filter IS NULL OR rp.release_date <= end_date_filter::date)
  )
  
  SELECT json_build_object(
    'total_resources', (
      SELECT COUNT(DISTINCT profile_id) 
      FROM base_data
    ),
    'active_engagements', (
      SELECT COUNT(DISTINCT profile_id) 
      FROM base_data 
      WHERE engagement_complete = false 
      AND engagement_percentage IS NOT NULL 
      AND engagement_percentage > 0
    ),
    'completed_engagements', (
      SELECT COUNT(DISTINCT profile_id) 
      FROM base_data 
      WHERE engagement_complete = true
    ),
    
    'by_resource_type', (
      SELECT COALESCE(json_agg(
        json_build_object(
          'name', resource_type_name,
          'count', count
        ) ORDER BY count DESC
      ), '[]'::json)
      FROM (
        SELECT 
          COALESCE(resource_type_name, 'Unspecified') as resource_type_name,
          COUNT(DISTINCT profile_id) as count
        FROM base_data
        GROUP BY resource_type_name
      ) sub
    ),
    
    'by_bill_type', (
      SELECT COALESCE(json_agg(
        json_build_object(
          'name', bill_type_name,
          'count', count
        ) ORDER BY count DESC
      ), '[]'::json)
      FROM (
        SELECT 
          COALESCE(bill_type_name, 'Unspecified') as bill_type_name,
          COUNT(DISTINCT profile_id) as count
        FROM base_data
        GROUP BY bill_type_name
      ) sub
    ),
    
    'by_expertise_type', (
      SELECT COALESCE(json_agg(
        json_build_object(
          'name', expertise_type_name,
          'count', count
        ) ORDER BY count DESC
      ), '[]'::json)
      FROM (
        SELECT 
          COALESCE(expertise_type_name, 'Unspecified') as expertise_type_name,
          COUNT(DISTINCT profile_id) as count
        FROM base_data
        GROUP BY expertise_type_name
      ) sub
    ),
    
    'by_sbu', (
      SELECT COALESCE(json_agg(
        json_build_object(
          'name', sbu_name,
          'count', count
        ) ORDER BY count DESC
      ), '[]'::json)
      FROM (
        SELECT 
          COALESCE(sbu_name, 'Unspecified') as sbu_name,
          COUNT(DISTINCT profile_id) as count
        FROM base_data
        GROUP BY sbu_name
      ) sub
    )
    
  ) INTO result;
  
  RETURN result;
END;
$function$;
