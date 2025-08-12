
-- Function to get resource count statistics with filters
CREATE OR REPLACE FUNCTION get_resource_count_statistics(
  resource_type_filter text DEFAULT NULL,
  bill_type_filter text DEFAULT NULL,
  expertise_type_filter text DEFAULT NULL,
  sbu_filter text DEFAULT NULL,
  start_date_filter date DEFAULT NULL,
  end_date_filter date DEFAULT NULL
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result json;
BEGIN
  WITH filtered_resources AS (
    SELECT 
      rp.id,
      rp.profile_id,
      rp.engagement_percentage,
      rp.billing_percentage,
      rp.engagement_start_date,
      rp.release_date,
      rp.engagement_complete,
      rt.name as resource_type_name,
      bt.name as bill_type_name,
      et.name as expertise_type_name,
      s.name as sbu_name
    FROM resource_planning rp
    LEFT JOIN profiles p ON rp.profile_id = p.id
    LEFT JOIN resource_types rt ON p.resource_type = rt.id
    LEFT JOIN bill_types bt ON rp.bill_type_id = bt.id
    LEFT JOIN expertise_types et ON p.expertise = et.id
    LEFT JOIN sbus s ON p.sbu_id = s.id
    WHERE 
      (resource_type_filter IS NULL OR rt.name ILIKE '%' || resource_type_filter || '%')
      AND (bill_type_filter IS NULL OR bt.name ILIKE '%' || bill_type_filter || '%')
      AND (expertise_type_filter IS NULL OR et.name ILIKE '%' || expertise_type_filter || '%')
      AND (sbu_filter IS NULL OR s.name ILIKE '%' || sbu_filter || '%')
      AND (start_date_filter IS NULL OR rp.engagement_start_date >= start_date_filter)
      AND (end_date_filter IS NULL OR rp.engagement_start_date <= end_date_filter)
  )
  SELECT json_build_object(
    'total_resources', (SELECT COUNT(*) FROM filtered_resources),
    'active_engagements', (SELECT COUNT(*) FROM filtered_resources WHERE engagement_complete = false),
    'completed_engagements', (SELECT COUNT(*) FROM filtered_resources WHERE engagement_complete = true),
    'by_resource_type', (
      SELECT json_agg(
        json_build_object(
          'name', COALESCE(resource_type_name, 'Unassigned'),
          'count', count
        )
      )
      FROM (
        SELECT 
          resource_type_name,
          COUNT(*) as count
        FROM filtered_resources
        GROUP BY resource_type_name
        ORDER BY count DESC
      ) rt_stats
    ),
    'by_bill_type', (
      SELECT json_agg(
        json_build_object(
          'name', COALESCE(bill_type_name, 'Unassigned'),
          'count', count
        )
      )
      FROM (
        SELECT 
          bill_type_name,
          COUNT(*) as count
        FROM filtered_resources
        GROUP BY bill_type_name
        ORDER BY count DESC
      ) bt_stats
    ),
    'by_expertise_type', (
      SELECT json_agg(
        json_build_object(
          'name', COALESCE(expertise_type_name, 'Unassigned'),
          'count', count
        )
      )
      FROM (
        SELECT 
          expertise_type_name,
          COUNT(*) as count
        FROM filtered_resources
        GROUP BY expertise_type_name
        ORDER BY count DESC
      ) et_stats
    ),
    'by_sbu', (
      SELECT json_agg(
        json_build_object(
          'name', COALESCE(sbu_name, 'Unassigned'),
          'count', count
        )
      )
      FROM (
        SELECT 
          sbu_name,
          COUNT(*) as count
        FROM filtered_resources
        GROUP BY sbu_name
        ORDER BY count DESC
      ) sbu_stats
    )
  ) INTO result;
  
  RETURN COALESCE(result, '{}'::json);
END;
$$;

-- Function to get engagement percentage statistics with filters
CREATE OR REPLACE FUNCTION get_engagement_percentage_statistics(
  resource_type_filter text DEFAULT NULL,
  bill_type_filter text DEFAULT NULL,
  expertise_type_filter text DEFAULT NULL,
  sbu_filter text DEFAULT NULL,
  start_date_filter date DEFAULT NULL,
  end_date_filter date DEFAULT NULL
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result json;
BEGIN
  WITH filtered_resources AS (
    SELECT 
      rp.id,
      rp.profile_id,
      rp.engagement_percentage,
      rp.billing_percentage,
      rp.engagement_start_date,
      rp.release_date,
      rp.engagement_complete,
      rt.name as resource_type_name,
      bt.name as bill_type_name,
      et.name as expertise_type_name,
      s.name as sbu_name,
      COALESCE(gi.first_name, p.first_name) as first_name,
      COALESCE(gi.last_name, p.last_name) as last_name
    FROM resource_planning rp
    LEFT JOIN profiles p ON rp.profile_id = p.id
    LEFT JOIN general_information gi ON p.id = gi.profile_id
    LEFT JOIN resource_types rt ON p.resource_type = rt.id
    LEFT JOIN bill_types bt ON rp.bill_type_id = bt.id
    LEFT JOIN expertise_types et ON p.expertise = et.id
    LEFT JOIN sbus s ON p.sbu_id = s.id
    WHERE 
      (resource_type_filter IS NULL OR rt.name ILIKE '%' || resource_type_filter || '%')
      AND (bill_type_filter IS NULL OR bt.name ILIKE '%' || bill_type_filter || '%')
      AND (expertise_type_filter IS NULL OR et.name ILIKE '%' || expertise_type_filter || '%')
      AND (sbu_filter IS NULL OR s.name ILIKE '%' || sbu_filter || '%')
      AND (start_date_filter IS NULL OR rp.engagement_start_date >= start_date_filter)
      AND (end_date_filter IS NULL OR rp.engagement_start_date <= end_date_filter)
      AND rp.engagement_percentage IS NOT NULL
  )
  SELECT json_build_object(
    'total_resources', (SELECT COUNT(*) FROM filtered_resources),
    'average_engagement', (
      SELECT ROUND(AVG(engagement_percentage), 2)
      FROM filtered_resources
    ),
    'average_billing', (
      SELECT ROUND(AVG(billing_percentage), 2)
      FROM filtered_resources
      WHERE billing_percentage IS NOT NULL
    ),
    'engagement_distribution', (
      SELECT json_agg(
        json_build_object(
          'range', range_label,
          'count', count
        )
      )
      FROM (
        SELECT 
          CASE 
            WHEN engagement_percentage = 0 THEN '0%'
            WHEN engagement_percentage > 0 AND engagement_percentage <= 25 THEN '1-25%'
            WHEN engagement_percentage > 25 AND engagement_percentage <= 50 THEN '26-50%'
            WHEN engagement_percentage > 50 AND engagement_percentage <= 75 THEN '51-75%'
            WHEN engagement_percentage > 75 AND engagement_percentage < 100 THEN '76-99%'
            WHEN engagement_percentage = 100 THEN '100%'
            ELSE 'Over 100%'
          END as range_label,
          COUNT(*) as count
        FROM filtered_resources
        GROUP BY 
          CASE 
            WHEN engagement_percentage = 0 THEN '0%'
            WHEN engagement_percentage > 0 AND engagement_percentage <= 25 THEN '1-25%'
            WHEN engagement_percentage > 25 AND engagement_percentage <= 50 THEN '26-50%'
            WHEN engagement_percentage > 50 AND engagement_percentage <= 75 THEN '51-75%'
            WHEN engagement_percentage > 75 AND engagement_percentage < 100 THEN '76-99%'
            WHEN engagement_percentage = 100 THEN '100%'
            ELSE 'Over 100%'
          END
        ORDER BY 
          CASE 
            WHEN engagement_percentage = 0 THEN 1
            WHEN engagement_percentage > 0 AND engagement_percentage <= 25 THEN 2
            WHEN engagement_percentage > 25 AND engagement_percentage <= 50 THEN 3
            WHEN engagement_percentage > 50 AND engagement_percentage <= 75 THEN 4
            WHEN engagement_percentage > 75 AND engagement_percentage < 100 THEN 5
            WHEN engagement_percentage = 100 THEN 6
            ELSE 7
          END
      ) dist_stats
    ),
    'by_resource_type', (
      SELECT json_agg(
        json_build_object(
          'name', COALESCE(resource_type_name, 'Unassigned'),
          'average_engagement', ROUND(avg_engagement, 2),
          'count', count
        )
      )
      FROM (
        SELECT 
          resource_type_name,
          AVG(engagement_percentage) as avg_engagement,
          COUNT(*) as count
        FROM filtered_resources
        GROUP BY resource_type_name
        ORDER BY avg_engagement DESC
      ) rt_stats
    ),
    'by_bill_type', (
      SELECT json_agg(
        json_build_object(
          'name', COALESCE(bill_type_name, 'Unassigned'),
          'average_engagement', ROUND(avg_engagement, 2),
          'count', count
        )
      )
      FROM (
        SELECT 
          bill_type_name,
          AVG(engagement_percentage) as avg_engagement,
          COUNT(*) as count
        FROM filtered_resources
        GROUP BY bill_type_name
        ORDER BY avg_engagement DESC
      ) bt_stats
    ),
    'by_expertise_type', (
      SELECT json_agg(
        json_build_object(
          'name', COALESCE(expertise_type_name, 'Unassigned'),
          'average_engagement', ROUND(avg_engagement, 2),
          'count', count
        )
      )
      FROM (
        SELECT 
          expertise_type_name,
          AVG(engagement_percentage) as avg_engagement,
          COUNT(*) as count
        FROM filtered_resources
        GROUP BY expertise_type_name
        ORDER BY avg_engagement DESC
      ) et_stats
    ),
    'by_sbu', (
      SELECT json_agg(
        json_build_object(
          'name', COALESCE(sbu_name, 'Unassigned'),
          'average_engagement', ROUND(avg_engagement, 2),
          'count', count
        )
      )
      FROM (
        SELECT 
          sbu_name,
          AVG(engagement_percentage) as avg_engagement,
          COUNT(*) as count
        FROM filtered_resources
        GROUP BY sbu_name
        ORDER BY avg_engagement DESC
      ) sbu_stats
    ),
    'over_allocated_resources', (
      SELECT json_agg(
        json_build_object(
          'profile_id', profile_id,
          'name', first_name || ' ' || last_name,
          'engagement_percentage', engagement_percentage,
          'resource_type', COALESCE(resource_type_name, 'Unassigned'),
          'sbu', COALESCE(sbu_name, 'Unassigned')
        )
      )
      FROM filtered_resources
      WHERE engagement_percentage > 100
      ORDER BY engagement_percentage DESC
    )
  ) INTO result;
  
  RETURN COALESCE(result, '{}'::json);
END;
$$;
