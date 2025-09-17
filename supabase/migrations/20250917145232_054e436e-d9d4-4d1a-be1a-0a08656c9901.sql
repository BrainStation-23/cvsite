-- Drop and recreate the get_non_billed_resources_overview_statistics function
DROP FUNCTION IF EXISTS public.get_non_billed_resources_overview_statistics(text, text, text[], text[], text[], boolean);

CREATE OR REPLACE FUNCTION public.get_non_billed_resources_overview_statistics(
  start_date_filter text DEFAULT NULL,
  end_date_filter text DEFAULT NULL,
  sbu_filter text[] DEFAULT NULL,
  expertise_filter text[] DEFAULT NULL,
  bill_type_filter text[] DEFAULT NULL,
  bench_filter boolean DEFAULT NULL
)
RETURNS TABLE(
  overview json,
  experience_distribution json,
  recent_trends json
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  WITH filtered_non_billed AS (
    SELECT 
      nbr.*,
      p.first_name,
      p.last_name,
      p.employee_id,
      p.sbu_id,
      p.expertise,
      p.career_start_date,
      s.name as sbu_name,
      et.name as expertise_name,
      bt.name as bill_type_name,
      bt.color_code,
      CASE 
        WHEN nbr.non_billed_resources_date IS NOT NULL THEN
          CURRENT_DATE - nbr.non_billed_resources_date
        ELSE 0
      END as duration_days,
      -- Calculate total years of experience
      CASE 
        WHEN p.career_start_date IS NOT NULL THEN
          EXTRACT(YEAR FROM AGE(CURRENT_DATE, p.career_start_date))
        ELSE 0
      END as total_years_experience,
      -- Determine if this is a bench resource
      CASE WHEN bbt.bill_type IS NOT NULL THEN true ELSE false END as is_bench
    FROM non_billed_resources nbr
    LEFT JOIN profiles p ON nbr.profile_id = p.id
    LEFT JOIN sbus s ON p.sbu_id = s.id
    LEFT JOIN expertise_types et ON p.expertise = et.id
    LEFT JOIN bill_types bt ON nbr.bill_type_id = bt.id
    LEFT JOIN bench_bill_types bbt ON nbr.bill_type_id = bbt.bill_type
    WHERE 
      p.active = true
      AND (start_date_filter IS NULL OR nbr.non_billed_resources_date >= start_date_filter::date)
      AND (end_date_filter IS NULL OR nbr.non_billed_resources_date <= end_date_filter::date)
      AND (sbu_filter IS NULL OR s.name = ANY(sbu_filter))
      AND (expertise_filter IS NULL OR et.name = ANY(expertise_filter))
      AND (bill_type_filter IS NULL OR bt.name = ANY(bill_type_filter))
      AND (
        bench_filter IS NULL 
        OR (bench_filter = true AND bbt.bill_type IS NOT NULL)
        OR (bench_filter = false AND bbt.bill_type IS NULL)
      )
  ),
  
  -- Separate bench resources for bench-specific calculations
  bench_resources AS (
    SELECT *
    FROM filtered_non_billed
    WHERE is_bench = true
  ),
  
  -- Calculate overview statistics
  overview_stats AS (
    SELECT
      -- Total non-billed resources count
      COUNT(*) as total_non_billed_resources_count,
      
      -- Average duration in days for all non-billed resources
      COALESCE(AVG(duration_days), 0) as avg_non_billed_resources_duration_days,
      
      -- Max duration for all non-billed resources
      COALESCE(MAX(duration_days), 0) as max_non_billed_resources_duration_days,
      
      -- Min duration for all non-billed resources
      COALESCE(MIN(duration_days), 0) as min_non_billed_resources_duration_days,
      
      -- Average experience years
      COALESCE(AVG(total_years_experience), 0) as avg_experience_years,
      
      -- Count of resources with duration > 30 days (critical)
      COUNT(*) FILTER (WHERE duration_days > 30) as non_billed_critical_count,
      
      -- Count of resources with duration <= 30 days (initial)
      COUNT(*) FILTER (WHERE duration_days <= 30) as non_billed_initial_count
    FROM filtered_non_billed
  ),
  
  -- Calculate bench-specific statistics
  bench_stats AS (
    SELECT
      COUNT(*) as total_bench_count,
      COALESCE(AVG(duration_days), 0) as avg_bench_duration_days,
      COUNT(*) FILTER (WHERE duration_days <= 30) as bench_initial_count,
      COUNT(*) FILTER (WHERE duration_days > 30) as bench_critical_count
    FROM bench_resources
  ),
  
  -- Calculate experience distribution
  experience_dist AS (
    SELECT
      COUNT(*) FILTER (WHERE total_years_experience < 2) as junior,
      COUNT(*) FILTER (WHERE total_years_experience >= 2 AND total_years_experience < 5) as mid,
      COUNT(*) FILTER (WHERE total_years_experience >= 5 AND total_years_experience < 10) as senior,
      COUNT(*) FILTER (WHERE total_years_experience >= 10) as lead,
      COUNT(*) FILTER (WHERE total_years_experience = 0) as unknown,
      COUNT(*) as total_count
    FROM filtered_non_billed
  ),
  
  -- Calculate recent trends
  recent_trends_data AS (
    SELECT
      COUNT(*) FILTER (WHERE non_billed_resources_date >= CURRENT_DATE - INTERVAL '7 days') as new_non_billed_resources_last_7_days,
      COUNT(*) FILTER (WHERE non_billed_resources_date >= CURRENT_DATE - INTERVAL '30 days') as new_non_billed_resources_last_30_days
    FROM filtered_non_billed
  )
  
  SELECT
    -- Overview JSON
    json_build_object(
      'total_non_billed_resources_count', os.total_non_billed_resources_count,
      'avg_non_billed_resources_duration_days', os.avg_non_billed_resources_duration_days,
      'max_non_billed_resources_duration_days', os.max_non_billed_resources_duration_days,
      'min_non_billed_resources_duration_days', os.min_non_billed_resources_duration_days,
      'avg_experience_years', os.avg_experience_years,
      'non_billed_initial_count', os.non_billed_initial_count,
      'non_billed_critical_count', os.non_billed_critical_count,
      'total_bench_count', bs.total_bench_count,
      'avg_bench_duration_days', bs.avg_bench_duration_days,
      'bench_initial_count', bs.bench_initial_count,
      'bench_critical_count', bs.bench_critical_count
    ) as overview,
    
    -- Experience distribution JSON
    json_build_object(
      'junior', ed.junior,
      'mid', ed.mid,
      'senior', ed.senior,
      'lead', ed.lead,
      'unknown', ed.unknown,
      'total_count', ed.total_count
    ) as experience_distribution,
    
    -- Recent trends JSON
    json_build_object(
      'new_non_billed_resources_last_7_days', rt.new_non_billed_resources_last_7_days,
      'new_non_billed_resources_last_30_days', rt.new_non_billed_resources_last_30_days
    ) as recent_trends
    
  FROM overview_stats os
  CROSS JOIN bench_stats bs
  CROSS JOIN experience_dist ed
  CROSS JOIN recent_trends_data rt;
END;
$$;