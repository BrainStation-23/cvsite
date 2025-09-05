-- Create new RPC function for pivot statistics with grouping support
CREATE OR REPLACE FUNCTION public.get_resource_pivot_statistics_with_grouping(
  primary_dimension text DEFAULT 'sbu',
  secondary_dimension text DEFAULT 'bill_type',
  resource_type_filter uuid DEFAULT NULL,
  bill_type_filter text DEFAULT NULL,
  expertise_type_filter text DEFAULT NULL,
  sbu_filter text DEFAULT NULL,
  start_date_filter text DEFAULT NULL,
  end_date_filter text DEFAULT NULL,
  enable_grouping boolean DEFAULT false
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result json;
  pivot_data json;
  row_totals json;
  col_totals json;
  grand_total integer;
  grouping_info json;
BEGIN
  -- Build dynamic query for pivot data with grouping support
  WITH filtered_data AS (
    SELECT 
      rp.*,
      CASE 
        WHEN primary_dimension = 'sbu' THEN s.name
        WHEN primary_dimension = 'resource_type' THEN rt.name  
        WHEN primary_dimension = 'bill_type' THEN bt.name
        WHEN primary_dimension = 'expertise' THEN et.name
        ELSE 'Unknown'
      END as row_dimension,
      CASE 
        WHEN secondary_dimension = 'sbu' THEN s2.name
        WHEN secondary_dimension = 'resource_type' THEN rt2.name
        WHEN secondary_dimension = 'bill_type' THEN bt2.name  
        WHEN secondary_dimension = 'expertise' THEN et2.name
        ELSE 'Unknown'
      END as col_dimension,
      -- Add grouping information for SBU dimension
      CASE 
        WHEN primary_dimension = 'sbu' AND enable_grouping THEN 
          CASE WHEN s.is_department THEN 'Departments' ELSE 'Business Units' END
        ELSE NULL
      END as row_group,
      CASE 
        WHEN secondary_dimension = 'sbu' AND enable_grouping THEN 
          CASE WHEN s2.is_department THEN 'Departments' ELSE 'Business Units' END
        ELSE NULL
      END as col_group
    FROM resource_planning_enriched_view rp
    LEFT JOIN sbus s ON (primary_dimension = 'sbu' AND rp.sbu_name = s.name)
    LEFT JOIN resource_types rt ON (primary_dimension = 'resource_type' AND rp.profile_id IS NOT NULL)
    LEFT JOIN bill_types bt ON (primary_dimension = 'bill_type' AND rp.bill_type_name = bt.name)
    LEFT JOIN expertise_types et ON (primary_dimension = 'expertise' AND rp.profile_id IS NOT NULL)
    LEFT JOIN sbus s2 ON (secondary_dimension = 'sbu' AND rp.sbu_name = s2.name)
    LEFT JOIN resource_types rt2 ON (secondary_dimension = 'resource_type' AND rp.profile_id IS NOT NULL)
    LEFT JOIN bill_types bt2 ON (secondary_dimension = 'bill_type' AND rp.bill_type_name = bt2.name)
    LEFT JOIN expertise_types et2 ON (secondary_dimension = 'expertise' AND rp.profile_id IS NOT NULL)
    WHERE rp.profile_id IS NOT NULL
      AND (resource_type_filter IS NULL OR rp.bill_type_id = resource_type_filter)
      AND (bill_type_filter IS NULL OR rp.bill_type_name ILIKE '%' || bill_type_filter || '%')
      AND (expertise_type_filter IS NULL OR rp.profile_id IS NOT NULL)
      AND (sbu_filter IS NULL OR rp.sbu_name ILIKE '%' || sbu_filter || '%')
      AND (start_date_filter IS NULL OR rp.engagement_start_date >= start_date_filter::date)
      AND (end_date_filter IS NULL OR rp.release_date <= end_date_filter::date)
  ),
  pivot_summary AS (
    SELECT 
      row_dimension,
      col_dimension,
      row_group,
      col_group,
      COUNT(DISTINCT profile_id) as count
    FROM filtered_data
    WHERE row_dimension IS NOT NULL AND col_dimension IS NOT NULL
    GROUP BY row_dimension, col_dimension, row_group, col_group
  )
  
  -- Generate pivot data
  SELECT json_agg(
    json_build_object(
      'row_dimension', row_dimension,
      'col_dimension', col_dimension, 
      'count', count,
      'row_group', row_group,
      'col_group', col_group
    )
  ) INTO pivot_data
  FROM pivot_summary;
  
  -- Generate row totals with grouping
  SELECT json_agg(
    json_build_object(
      'dimension', dimension,
      'total', total,
      'group_name', group_name
    ) ORDER BY group_name NULLS LAST, dimension
  ) INTO row_totals
  FROM (
    SELECT 
      row_dimension as dimension,
      SUM(count) as total,
      row_group as group_name
    FROM pivot_summary
    GROUP BY row_dimension, row_group
  ) row_data;
  
  -- Generate column totals with grouping  
  SELECT json_agg(
    json_build_object(
      'dimension', dimension,
      'total', total,
      'group_name', group_name
    ) ORDER BY group_name NULLS LAST, dimension
  ) INTO col_totals
  FROM (
    SELECT 
      col_dimension as dimension,
      SUM(count) as total,
      col_group as group_name
    FROM pivot_summary
    GROUP BY col_dimension, col_group
  ) col_data;
  
  -- Calculate grand total
  SELECT SUM(count) INTO grand_total FROM pivot_summary;
  
  -- Generate grouping metadata
  IF enable_grouping THEN
    SELECT json_build_object(
      'row_groups', (
        SELECT json_agg(DISTINCT row_group ORDER BY row_group) 
        FROM pivot_summary 
        WHERE row_group IS NOT NULL
      ),
      'col_groups', (
        SELECT json_agg(DISTINCT col_group ORDER BY col_group) 
        FROM pivot_summary 
        WHERE col_group IS NOT NULL
      )
    ) INTO grouping_info;
  ELSE
    grouping_info := '{"row_groups": null, "col_groups": null}'::json;
  END IF;
  
  -- Build final result
  result := json_build_object(
    'pivot_data', COALESCE(pivot_data, '[]'::json),
    'row_totals', COALESCE(row_totals, '[]'::json),
    'col_totals', COALESCE(col_totals, '[]'::json), 
    'grand_total', COALESCE(grand_total, 0),
    'dimensions', json_build_object(
      'primary', primary_dimension,
      'secondary', secondary_dimension
    ),
    'grouping', json_build_object(
      'enabled', enable_grouping,
      'info', grouping_info
    )
  );
  
  RETURN result;
END;
$$;