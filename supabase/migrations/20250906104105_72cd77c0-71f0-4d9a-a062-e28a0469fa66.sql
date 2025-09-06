-- Create RPC function to get SBU billing metrics
CREATE OR REPLACE FUNCTION public.get_sbu_billing_metrics(
  start_date_filter date DEFAULT NULL,
  end_date_filter date DEFAULT NULL,
  sbu_filter uuid DEFAULT NULL
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  result_data json;
BEGIN
  WITH filtered_engagements AS (
    -- Get all resource planning entries with filters applied
    SELECT 
      rp.profile_id,
      rp.project_id,
      rp.bill_type_id,
      rp.engagement_percentage,
      rp.billing_percentage,
      rp.engagement_start_date,
      rp.release_date,
      p.sbu_id,
      s.name as sbu_name,
      bt.is_billable as bill_type_is_billable
    FROM resource_planning rp
    INNER JOIN profiles p ON rp.profile_id = p.id
    INNER JOIN sbus s ON p.sbu_id = s.id
    LEFT JOIN bill_types bt ON rp.bill_type_id = bt.id
    WHERE 
      -- Only active profiles
      p.active = true
      -- Only non-complete engagements
      AND rp.engagement_complete = false
      -- Date filters
      AND (start_date_filter IS NULL OR rp.engagement_start_date >= start_date_filter)
      AND (end_date_filter IS NULL OR rp.release_date <= end_date_filter)
      -- SBU filter
      AND (sbu_filter IS NULL OR p.sbu_id = sbu_filter)
  ),
  
  primary_engagements AS (
    -- Find the primary engagement for each profile (highest billing_percentage, then latest start date)
    SELECT DISTINCT ON (fe.profile_id)
      fe.profile_id,
      fe.sbu_id,
      fe.sbu_name,
      fe.bill_type_is_billable,
      fe.billing_percentage
    FROM filtered_engagements fe
    ORDER BY fe.profile_id, fe.billing_percentage DESC NULLS LAST, fe.engagement_start_date DESC NULLS LAST
  ),
  
  sbu_metrics AS (
    SELECT 
      pe.sbu_id,
      pe.sbu_name,
      -- Billable Resource Count: unique profiles with billable bill types
      COUNT(DISTINCT CASE WHEN pe.bill_type_is_billable = true THEN pe.profile_id END) as billable_resource_count,
      -- Billed Resource Count: unique profiles with billing_percentage > 0
      COUNT(DISTINCT CASE WHEN COALESCE(pe.billing_percentage, 0) > 0 THEN pe.profile_id END) as billed_resource_count,
      -- Actual Billed: sum of all billing_percentage / 100 from all engagements (not just primary)
      COALESCE(
        (SELECT SUM(COALESCE(fe.billing_percentage, 0)) / 100.0
         FROM filtered_engagements fe 
         WHERE fe.sbu_id = pe.sbu_id), 
        0
      ) as actual_billed
    FROM primary_engagements pe
    GROUP BY pe.sbu_id, pe.sbu_name
  ),
  
  total_metrics AS (
    SELECT 
      SUM(sm.billable_resource_count) as total_billable_resources,
      SUM(sm.billed_resource_count) as total_billed_resources,
      SUM(sm.actual_billed) as total_actual_billed
    FROM sbu_metrics sm
  )
  
  SELECT json_build_object(
    'sbu_metrics', COALESCE(
      (SELECT json_agg(
        json_build_object(
          'sbu_id', sm.sbu_id,
          'sbu_name', sm.sbu_name,
          'billable_resource_count', sm.billable_resource_count,
          'billed_resource_count', sm.billed_resource_count,
          'actual_billed', ROUND(sm.actual_billed::numeric, 2)
        )
        ORDER BY sm.sbu_name
      )
      FROM sbu_metrics sm), 
      '[]'::json
    ),
    'totals', json_build_object(
      'total_billable_resources', COALESCE((SELECT total_billable_resources FROM total_metrics), 0),
      'total_billed_resources', COALESCE((SELECT total_billed_resources FROM total_metrics), 0),
      'total_actual_billed', ROUND(COALESCE((SELECT total_actual_billed FROM total_metrics), 0)::numeric, 2)
    )
  )
  INTO result_data;
  
  RETURN result_data;
END;
$function$;