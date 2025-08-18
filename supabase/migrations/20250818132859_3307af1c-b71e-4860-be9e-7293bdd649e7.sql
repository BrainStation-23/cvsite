
-- Create a function to get pivot statistics for resources
CREATE OR REPLACE FUNCTION public.get_resource_pivot_statistics(
  primary_dimension text DEFAULT 'sbu',
  secondary_dimension text DEFAULT 'bill_type',
  resource_type_filter uuid DEFAULT NULL,
  bill_type_filter uuid DEFAULT NULL,
  expertise_type_filter uuid DEFAULT NULL,
  sbu_filter uuid DEFAULT NULL,
  start_date_filter date DEFAULT NULL,
  end_date_filter date DEFAULT NULL
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  result json;
  pivot_data json;
  totals_data json;
BEGIN
  -- Build the pivot query dynamically based on dimensions
  WITH filtered_profiles AS (
    SELECT DISTINCT
      p.id,
      s.id as sbu_id,
      s.name as sbu_name,
      rt.id as resource_type_id,
      rt.name as resource_type_name,
      bt.id as bill_type_id,
      bt.name as bill_type_name,
      et.id as expertise_id,
      et.name as expertise_name,
      rp.engagement_complete,
      rp.engagement_percentage
    FROM profiles p
    LEFT JOIN sbus s ON p.sbu_id = s.id
    LEFT JOIN resource_types rt ON p.resource_type = rt.id
    LEFT JOIN expertise_types et ON p.expertise = et.id
    LEFT JOIN resource_planning rp ON p.id = rp.profile_id
    LEFT JOIN bill_types bt ON rp.bill_type_id = bt.id
    WHERE (sbu_filter IS NULL OR s.id = sbu_filter)
      AND (resource_type_filter IS NULL OR rt.id = resource_type_filter)
      AND (bill_type_filter IS NULL OR bt.id = bill_type_filter)
      AND (expertise_type_filter IS NULL OR et.id = expertise_type_filter)
      AND (start_date_filter IS NULL OR rp.engagement_start_date >= start_date_filter)
      AND (end_date_filter IS NULL OR rp.release_date <= end_date_filter)
  ),
  pivot_matrix AS (
    SELECT 
      CASE 
        WHEN primary_dimension = 'sbu' THEN COALESCE(sbu_name, 'Unspecified')
        WHEN primary_dimension = 'resource_type' THEN COALESCE(resource_type_name, 'Unspecified')
        WHEN primary_dimension = 'bill_type' THEN COALESCE(bill_type_name, 'Unspecified')
        WHEN primary_dimension = 'expertise' THEN COALESCE(expertise_name, 'Unspecified')
      END as row_dimension,
      CASE 
        WHEN secondary_dimension = 'sbu' THEN COALESCE(sbu_name, 'Unspecified')
        WHEN secondary_dimension = 'resource_type' THEN COALESCE(resource_type_name, 'Unspecified')
        WHEN secondary_dimension = 'bill_type' THEN COALESCE(bill_type_name, 'Unspecified')
        WHEN secondary_dimension = 'expertise' THEN COALESCE(expertise_name, 'Unspecified')
      END as col_dimension,
      COUNT(*) as count
    FROM filtered_profiles
    GROUP BY 
      row_dimension,
      col_dimension
    ORDER BY 
      row_dimension,
      col_dimension
  ),
  row_totals AS (
    SELECT 
      row_dimension,
      SUM(count) as total
    FROM pivot_matrix
    GROUP BY row_dimension
  ),
  col_totals AS (
    SELECT 
      col_dimension,
      SUM(count) as total
    FROM pivot_matrix
    GROUP BY col_dimension
  )
  SELECT json_build_object(
    'pivot_data', (
      SELECT json_agg(
        json_build_object(
          'row_dimension', row_dimension,
          'col_dimension', col_dimension,
          'count', count
        )
      )
      FROM pivot_matrix
    ),
    'row_totals', (
      SELECT json_agg(
        json_build_object(
          'dimension', row_dimension,
          'total', total
        )
      )
      FROM row_totals
    ),
    'col_totals', (
      SELECT json_agg(
        json_build_object(
          'dimension', col_dimension,
          'total', total
        )
      )
      FROM col_totals
    ),
    'grand_total', (
      SELECT COALESCE(SUM(count), 0) FROM pivot_matrix
    ),
    'dimensions', json_build_object(
      'primary', primary_dimension,
      'secondary', secondary_dimension
    )
  ) INTO result;
  
  RETURN result;
END;
$function$
