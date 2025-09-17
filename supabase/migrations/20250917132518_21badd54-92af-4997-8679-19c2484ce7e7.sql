-- Drop the existing function
DROP FUNCTION IF EXISTS public.get_non_billed_resources_overview_statistics(text, text, text[], text[], text[], boolean);

-- Recreate the function with updated return fields
CREATE OR REPLACE FUNCTION public.get_non_billed_resources_overview_statistics(
  start_date_filter text DEFAULT NULL,
  end_date_filter text DEFAULT NULL,
  sbu_filter text[] DEFAULT NULL,
  expertise_filter text[] DEFAULT NULL,
  bill_type_filter text[] DEFAULT NULL,
  bench_filter boolean DEFAULT NULL
)
RETURNS TABLE(
  overview jsonb,
  experience_distribution jsonb,
  recent_trends jsonb
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  start_date date;
  end_date date;
BEGIN
  -- Parse date filters
  start_date := CASE WHEN start_date_filter IS NOT NULL THEN start_date_filter::date ELSE NULL END;
  end_date := CASE WHEN end_date_filter IS NOT NULL THEN end_date_filter::date ELSE NULL END;

  RETURN QUERY
  WITH filtered_non_billed AS (
    SELECT 
      nbr.*,
      p.id as profile_id,
      p.employee_id,
      p.first_name,
      p.last_name,
      p.email,
      p.date_of_joining,
      p.career_start_date,
      p.sbu_id,
      p.expertise,
      s.name as sbu_name,
      et.name as expertise_name,
      bt.name as bill_type_name,
      bt.non_billed,
      COALESCE(DATE_PART('day', CURRENT_DATE - nbr.non_billed_resources_date), 0) as duration_days,
      -- Calculate total experience years
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
      ), 0) as experience_years
    FROM non_billed_resources nbr
    LEFT JOIN profiles p ON nbr.profile_id = p.id
    LEFT JOIN sbus s ON p.sbu_id = s.id
    LEFT JOIN expertise_types et ON p.expertise = et.id
    LEFT JOIN bill_types bt ON nbr.bill_type_id = bt.id
    WHERE p.active = true
    AND (start_date IS NULL OR nbr.non_billed_resources_date >= start_date)
    AND (end_date IS NULL OR nbr.non_billed_resources_date <= end_date)
    AND (sbu_filter IS NULL OR p.sbu_id = ANY(sbu_filter::uuid[]))
    AND (expertise_filter IS NULL OR p.expertise = ANY(expertise_filter::uuid[]))
    AND (bill_type_filter IS NULL OR nbr.bill_type_id = ANY(bill_type_filter::uuid[]))
    AND (bench_filter IS NULL OR 
         (bench_filter = true AND bt.non_billed = true) OR 
         (bench_filter = false))
  ),
  bench_resources AS (
    SELECT *
    FROM filtered_non_billed
    WHERE non_billed = true
  ),
  overview_stats AS (
    SELECT 
      COUNT(*)::int as total_non_billed_resources_count,
      COALESCE(AVG(duration_days), 0)::numeric(10,2) as avg_non_billed_resources_duration_days,
      COALESCE(MAX(duration_days), 0)::int as max_non_billed_resources_duration_days,
      COALESCE(MIN(duration_days), 0)::int as min_non_billed_resources_duration_days,
      COALESCE(AVG(experience_years), 0)::numeric(10,2) as avg_experience_years,
      -- New fields for initial and critical counts (all non-billed)
      COUNT(CASE WHEN duration_days < 30 THEN 1 END)::int as non_billed_initial_count,
      COUNT(CASE WHEN duration_days > 60 THEN 1 END)::int as non_billed_critical_count,
      -- Bench specific stats
      (SELECT COUNT(*)::int FROM bench_resources) as total_bench_count,
      (SELECT COALESCE(AVG(duration_days), 0)::numeric(10,2) FROM bench_resources) as avg_bench_duration_days,
      (SELECT COUNT(CASE WHEN duration_days < 30 THEN 1 END)::int FROM bench_resources) as bench_initial_count,
      (SELECT COUNT(CASE WHEN duration_days > 60 THEN 1 END)::int FROM bench_resources) as bench_critical_count
    FROM filtered_non_billed
  ),
  experience_stats AS (
    SELECT 
      COUNT(CASE WHEN experience_years < 1 THEN 1 END)::int as junior,
      COUNT(CASE WHEN experience_years >= 1 AND experience_years < 3 THEN 1 END)::int as mid,
      COUNT(CASE WHEN experience_years >= 3 AND experience_years < 8 THEN 1 END)::int as senior,
      COUNT(CASE WHEN experience_years >= 8 THEN 1 END)::int as lead,
      COUNT(CASE WHEN experience_years IS NULL THEN 1 END)::int as unknown,
      COUNT(*)::int as total_count
    FROM filtered_non_billed
  ),
  trend_stats AS (
    SELECT 
      COUNT(CASE WHEN nbr.created_at >= CURRENT_DATE - INTERVAL '7 days' THEN 1 END)::int as new_non_billed_resources_last_7_days,
      COUNT(CASE WHEN nbr.created_at >= CURRENT_DATE - INTERVAL '30 days' THEN 1 END)::int as new_non_billed_resources_last_30_days
    FROM non_billed_resources nbr
    LEFT JOIN profiles p ON nbr.profile_id = p.id
    LEFT JOIN bill_types bt ON nbr.bill_type_id = bt.id
    WHERE p.active = true
    AND (sbu_filter IS NULL OR p.sbu_id = ANY(sbu_filter::uuid[]))
    AND (expertise_filter IS NULL OR p.expertise = ANY(expertise_filter::uuid[]))
    AND (bill_type_filter IS NULL OR nbr.bill_type_id = ANY(bill_type_filter::uuid[]))
    AND (bench_filter IS NULL OR 
         (bench_filter = true AND bt.non_billed = true) OR 
         (bench_filter = false))
  )
  SELECT 
    jsonb_build_object(
      'total_non_billed_resources_count', os.total_non_billed_resources_count,
      'avg_non_billed_resources_duration_days', os.avg_non_billed_resources_duration_days,
      'max_non_billed_resources_duration_days', os.max_non_billed_resources_duration_days,
      'min_non_billed_resources_duration_days', os.min_non_billed_resources_duration_days,
      'avg_experience_years', os.avg_experience_years,
      'non_billed_initial_count', os.non_billed_initial_count,
      'non_billed_critical_count', os.non_billed_critical_count,
      'total_bench_count', os.total_bench_count,
      'avg_bench_duration_days', os.avg_bench_duration_days,
      'bench_initial_count', os.bench_initial_count,
      'bench_critical_count', os.bench_critical_count
    ) as overview,
    jsonb_build_object(
      'junior', es.junior,
      'mid', es.mid,
      'senior', es.senior,
      'lead', es.lead,
      'unknown', es.unknown,
      'total_count', es.total_count
    ) as experience_distribution,
    jsonb_build_object(
      'new_non_billed_resources_last_7_days', ts.new_non_billed_resources_last_7_days,
      'new_non_billed_resources_last_30_days', ts.new_non_billed_resources_last_30_days
    ) as recent_trends
  FROM overview_stats os, experience_stats es, trend_stats ts;
END;
$$;