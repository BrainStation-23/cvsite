-- Update the get_non_billed_resources_overview_statistics function to include SBU-grouped experience distribution
CREATE OR REPLACE FUNCTION public.get_non_billed_resources_overview_statistics(
  start_date_filter date DEFAULT NULL,
  end_date_filter date DEFAULT NULL,
  sbu_filter uuid[] DEFAULT NULL,
  expertise_filter uuid[] DEFAULT NULL,
  bill_type_filter uuid[] DEFAULT NULL,
  bench_filter boolean DEFAULT NULL
)
RETURNS TABLE(
  overview jsonb,
  experience_distribution jsonb,
  recent_trends jsonb,
  sbu_experience_distribution jsonb
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  filtered_non_billed_data jsonb;
BEGIN
  -- Get filtered non-billed resources data
  WITH filtered_data AS (
    SELECT 
      nbr.profile_id,
      nbr.non_billed_resources_date,
      nbr.non_billed_resources_feedback,
      nbr.bill_type_id,
      bt.name as bill_type_name,
      bt.color_code as bill_type_color,
      bt.non_billed as is_bench_bill_type,
      p.first_name || ' ' || p.last_name as employee_name,
      p.employee_id,
      p.sbu_id,
      s.name as sbu_name,
      s.color_code as sbu_color_code,
      et.name as expertise_name,
      EXTRACT(EPOCH FROM age(CURRENT_DATE, nbr.non_billed_resources_date))/86400 as duration_days,
      CASE 
        WHEN EXTRACT(EPOCH FROM age(CURRENT_DATE, nbr.non_billed_resources_date))/86400 <= 7 THEN 'initial'
        WHEN EXTRACT(EPOCH FROM age(CURRENT_DATE, nbr.non_billed_resources_date))/86400 >= 30 THEN 'critical'
        ELSE 'normal'
      END as status_category,
      COALESCE((
        SELECT SUM(
          CASE 
            WHEN ex.is_current THEN 
              EXTRACT(EPOCH FROM age(CURRENT_DATE, ex.start_date)) / 31536000.0
            ELSE 
              EXTRACT(EPOCH FROM age(COALESCE(ex.end_date, CURRENT_DATE), ex.start_date)) / 31536000.0
          END
        )
        FROM experiences ex 
        WHERE ex.profile_id = p.id AND ex.start_date IS NOT NULL
      ), 0) as total_experience_years
    FROM non_billed_resources nbr
    LEFT JOIN profiles p ON nbr.profile_id = p.id
    LEFT JOIN bill_types bt ON nbr.bill_type_id = bt.id
    LEFT JOIN sbus s ON p.sbu_id = s.id
    LEFT JOIN expertise_types et ON p.expertise = et.id
    WHERE p.active = true
      AND (start_date_filter IS NULL OR nbr.non_billed_resources_date >= start_date_filter)
      AND (end_date_filter IS NULL OR nbr.non_billed_resources_date <= end_date_filter)
      AND (sbu_filter IS NULL OR p.sbu_id = ANY(sbu_filter))
      AND (expertise_filter IS NULL OR p.expertise = ANY(expertise_filter))
      AND (bill_type_filter IS NULL OR nbr.bill_type_id = ANY(bill_type_filter))
      AND (bench_filter IS NULL OR bt.non_billed = bench_filter)
  ),
  
  -- Overview statistics
  overview_stats AS (
    SELECT jsonb_build_object(
      'total_non_billed_resources_count', COUNT(*)::int,
      'avg_non_billed_resources_duration_days', ROUND(AVG(duration_days)::numeric, 2),
      'max_non_billed_resources_duration_days', MAX(duration_days)::int,
      'min_non_billed_resources_duration_days', MIN(duration_days)::int,
      'avg_experience_years', ROUND(AVG(total_experience_years)::numeric, 2),
      'non_billed_initial_count', COUNT(*) FILTER (WHERE status_category = 'initial')::int,
      'non_billed_critical_count', COUNT(*) FILTER (WHERE status_category = 'critical')::int,
      'total_bench_count', COUNT(*) FILTER (WHERE is_bench_bill_type = true)::int,
      'avg_bench_duration_days', ROUND(AVG(duration_days) FILTER (WHERE is_bench_bill_type = true)::numeric, 2),
      'bench_initial_count', COUNT(*) FILTER (WHERE is_bench_bill_type = true AND status_category = 'initial')::int,
      'bench_critical_count', COUNT(*) FILTER (WHERE is_bench_bill_type = true AND status_category = 'critical')::int
    ) as overview_data
    FROM filtered_data
  ),
  
  -- Overall experience distribution
  exp_distribution AS (
    SELECT jsonb_build_object(
      'junior', COUNT(*) FILTER (WHERE total_experience_years < 2)::int,
      'mid', COUNT(*) FILTER (WHERE total_experience_years >= 2 AND total_experience_years < 5)::int,
      'senior', COUNT(*) FILTER (WHERE total_experience_years >= 5 AND total_experience_years < 8)::int,
      'lead', COUNT(*) FILTER (WHERE total_experience_years >= 8)::int,
      'unknown', COUNT(*) FILTER (WHERE total_experience_years IS NULL OR total_experience_years = 0)::int,
      'total_count', COUNT(*)::int
    ) as exp_data
    FROM filtered_data
  ),
  
  -- SBU-grouped experience distribution
  sbu_exp_distribution AS (
    SELECT jsonb_agg(
      jsonb_build_object(
        'sbu_id', sbu_id,
        'sbu_name', sbu_name,
        'sbu_color_code', sbu_color_code,
        'experience_distribution', jsonb_build_object(
          'junior', junior_count,
          'mid', mid_count,
          'senior', senior_count,
          'lead', lead_count,
          'unknown', unknown_count,
          'total_count', total_count
        )
      ) ORDER BY sbu_name
    ) as sbu_exp_data
    FROM (
      SELECT 
        sbu_id,
        sbu_name,
        sbu_color_code,
        COUNT(*) FILTER (WHERE total_experience_years < 2)::int as junior_count,
        COUNT(*) FILTER (WHERE total_experience_years >= 2 AND total_experience_years < 5)::int as mid_count,
        COUNT(*) FILTER (WHERE total_experience_years >= 5 AND total_experience_years < 8)::int as senior_count,
        COUNT(*) FILTER (WHERE total_experience_years >= 8)::int as lead_count,
        COUNT(*) FILTER (WHERE total_experience_years IS NULL OR total_experience_years = 0)::int as unknown_count,
        COUNT(*)::int as total_count
      FROM filtered_data
      WHERE sbu_id IS NOT NULL
      GROUP BY sbu_id, sbu_name, sbu_color_code
      HAVING COUNT(*) > 0
    ) sbu_groups
  ),
  
  -- Recent trends
  trends_data AS (
    SELECT jsonb_build_object(
      'new_non_billed_resources_last_7_days', COUNT(*) FILTER (WHERE duration_days <= 7)::int,
      'new_non_billed_resources_last_30_days', COUNT(*) FILTER (WHERE duration_days <= 30)::int
    ) as trends
    FROM filtered_data
  )
  
  SELECT 
    o.overview_data,
    e.exp_data,
    t.trends,
    COALESCE(s.sbu_exp_data, '[]'::jsonb)
  FROM overview_stats o
  CROSS JOIN exp_distribution e
  CROSS JOIN trends_data t
  CROSS JOIN sbu_exp_distribution s;
END;
$$;