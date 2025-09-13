-- Bench Analytics Backend Functions

-- 1. Bench Overview Statistics
CREATE OR REPLACE FUNCTION public.get_bench_overview_statistics(
  start_date_filter date DEFAULT NULL,
  end_date_filter date DEFAULT NULL,
  sbu_filter uuid[] DEFAULT NULL,
  expertise_filter uuid[] DEFAULT NULL,
  bill_type_filter uuid[] DEFAULT NULL
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result_data json;
BEGIN
  WITH filtered_bench AS (
    SELECT 
      b.*,
      p.employee_id,
      p.sbu_id,
      p.expertise,
      COALESCE(gi.first_name, p.first_name) as first_name,
      COALESCE(gi.last_name, p.last_name) as last_name,
      CASE 
        WHEN p.career_start_date IS NOT NULL THEN 
          ROUND(EXTRACT(EPOCH FROM age(CURRENT_DATE, p.career_start_date)) / 31536000.0, 1)
        ELSE NULL 
      END as total_years_experience,
      EXTRACT(EPOCH FROM age(CURRENT_DATE, b.bench_date::date))::integer / 86400 as bench_duration_days
    FROM bench b
    LEFT JOIN profiles p ON b.profile_id = p.id
    LEFT JOIN general_information gi ON p.id = gi.profile_id
    WHERE 
      (start_date_filter IS NULL OR b.bench_date >= start_date_filter)
      AND (end_date_filter IS NULL OR b.bench_date <= end_date_filter)
      AND (sbu_filter IS NULL OR p.sbu_id = ANY(sbu_filter))
      AND (expertise_filter IS NULL OR p.expertise = ANY(expertise_filter))
      AND (bill_type_filter IS NULL OR b.bill_type_id = ANY(bill_type_filter))
  ),
  overview_stats AS (
    SELECT 
      COUNT(*) as total_bench_count,
      ROUND(AVG(bench_duration_days), 1) as avg_bench_duration_days,
      MAX(bench_duration_days) as max_bench_duration_days,
      MIN(bench_duration_days) as min_bench_duration_days,
      COUNT(CASE WHEN bench_duration_days > 30 THEN 1 END) as long_term_bench_count,
      COUNT(CASE WHEN bench_duration_days > 90 THEN 1 END) as critical_bench_count,
      ROUND(AVG(total_years_experience), 1) as avg_experience_years
    FROM filtered_bench
  ),
  experience_breakdown AS (
    SELECT 
      json_build_object(
        'junior', COUNT(CASE WHEN total_years_experience < 3 THEN 1 END),
        'mid', COUNT(CASE WHEN total_years_experience >= 3 AND total_years_experience < 8 THEN 1 END),
        'senior', COUNT(CASE WHEN total_years_experience >= 8 THEN 1 END),
        'unknown', COUNT(CASE WHEN total_years_experience IS NULL THEN 1 END)
      ) as experience_distribution
    FROM filtered_bench
  ),
  recent_trends AS (
    SELECT 
      COUNT(CASE WHEN b.bench_date >= CURRENT_DATE - INTERVAL '7 days' THEN 1 END) as new_bench_last_7_days,
      COUNT(CASE WHEN b.bench_date >= CURRENT_DATE - INTERVAL '30 days' THEN 1 END) as new_bench_last_30_days
    FROM filtered_bench b
  )
  SELECT json_build_object(
    'overview', row_to_json(overview_stats.*),
    'experience_distribution', experience_breakdown.experience_distribution,
    'recent_trends', row_to_json(recent_trends.*)
  )
  INTO result_data
  FROM overview_stats, experience_breakdown, recent_trends;
  
  RETURN COALESCE(result_data, '{}'::json);
END;
$$;

-- 2. Bench Dimensional Analysis
CREATE OR REPLACE FUNCTION public.get_bench_dimensional_analysis(
  start_date_filter date DEFAULT NULL,
  end_date_filter date DEFAULT NULL,
  group_by_dimension text DEFAULT 'sbu'
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result_data json;
BEGIN
  IF group_by_dimension = 'sbu' THEN
    SELECT json_agg(
      json_build_object(
        'dimension_id', sbu_id,
        'dimension_name', sbu_name,
        'total_count', total_count,
        'avg_duration_days', avg_duration_days,
        'long_term_count', long_term_count,
        'avg_experience_years', avg_experience_years
      )
    )
    INTO result_data
    FROM (
      SELECT 
        p.sbu_id,
        s.name as sbu_name,
        COUNT(*) as total_count,
        ROUND(AVG(EXTRACT(EPOCH FROM age(CURRENT_DATE, b.bench_date::date))::integer / 86400), 1) as avg_duration_days,
        COUNT(CASE WHEN EXTRACT(EPOCH FROM age(CURRENT_DATE, b.bench_date::date))::integer / 86400 > 30 THEN 1 END) as long_term_count,
        ROUND(AVG(
          CASE 
            WHEN p.career_start_date IS NOT NULL THEN 
              EXTRACT(EPOCH FROM age(CURRENT_DATE, p.career_start_date)) / 31536000.0
            ELSE NULL 
          END
        ), 1) as avg_experience_years
      FROM bench b
      LEFT JOIN profiles p ON b.profile_id = p.id
      LEFT JOIN sbus s ON p.sbu_id = s.id
      WHERE 
        (start_date_filter IS NULL OR b.bench_date >= start_date_filter)
        AND (end_date_filter IS NULL OR b.bench_date <= end_date_filter)
      GROUP BY p.sbu_id, s.name
      ORDER BY total_count DESC
    ) sbu_analysis;
    
  ELSIF group_by_dimension = 'expertise' THEN
    SELECT json_agg(
      json_build_object(
        'dimension_id', expertise_id,
        'dimension_name', expertise_name,
        'total_count', total_count,
        'avg_duration_days', avg_duration_days,
        'long_term_count', long_term_count,
        'avg_experience_years', avg_experience_years
      )
    )
    INTO result_data
    FROM (
      SELECT 
        p.expertise as expertise_id,
        et.name as expertise_name,
        COUNT(*) as total_count,
        ROUND(AVG(EXTRACT(EPOCH FROM age(CURRENT_DATE, b.bench_date::date))::integer / 86400), 1) as avg_duration_days,
        COUNT(CASE WHEN EXTRACT(EPOCH FROM age(CURRENT_DATE, b.bench_date::date))::integer / 86400 > 30 THEN 1 END) as long_term_count,
        ROUND(AVG(
          CASE 
            WHEN p.career_start_date IS NOT NULL THEN 
              EXTRACT(EPOCH FROM age(CURRENT_DATE, p.career_start_date)) / 31536000.0
            ELSE NULL 
          END
        ), 1) as avg_experience_years
      FROM bench b
      LEFT JOIN profiles p ON b.profile_id = p.id
      LEFT JOIN expertise_types et ON p.expertise = et.id
      WHERE 
        (start_date_filter IS NULL OR b.bench_date >= start_date_filter)
        AND (end_date_filter IS NULL OR b.bench_date <= end_date_filter)
      GROUP BY p.expertise, et.name
      ORDER BY total_count DESC
    ) expertise_analysis;
    
  ELSIF group_by_dimension = 'bill_type' THEN
    SELECT json_agg(
      json_build_object(
        'dimension_id', bill_type_id,
        'dimension_name', bill_type_name,
        'total_count', total_count,
        'avg_duration_days', avg_duration_days,
        'long_term_count', long_term_count,
        'color_code', color_code
      )
    )
    INTO result_data
    FROM (
      SELECT 
        b.bill_type_id,
        bt.name as bill_type_name,
        bt.color_code,
        COUNT(*) as total_count,
        ROUND(AVG(EXTRACT(EPOCH FROM age(CURRENT_DATE, b.bench_date::date))::integer / 86400), 1) as avg_duration_days,
        COUNT(CASE WHEN EXTRACT(EPOCH FROM age(CURRENT_DATE, b.bench_date::date))::integer / 86400 > 30 THEN 1 END) as long_term_count
      FROM bench b
      LEFT JOIN bill_types bt ON b.bill_type_id = bt.id
      WHERE 
        (start_date_filter IS NULL OR b.bench_date >= start_date_filter)
        AND (end_date_filter IS NULL OR b.bench_date <= end_date_filter)
      GROUP BY b.bill_type_id, bt.name, bt.color_code
      ORDER BY total_count DESC
    ) bill_type_analysis;
  END IF;
  
  RETURN COALESCE(result_data, '[]'::json);
END;
$$;

-- 3. Bench Risk Analytics
CREATE OR REPLACE FUNCTION public.get_bench_risk_analytics(
  risk_threshold_days integer DEFAULT 30
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result_data json;
BEGIN
  WITH risk_profiles AS (
    SELECT 
      p.id as profile_id,
      p.employee_id,
      COALESCE(gi.first_name, p.first_name) as first_name,
      COALESCE(gi.last_name, p.last_name) as last_name,
      s.name as sbu_name,
      et.name as expertise_name,
      bt.name as bill_type_name,
      bt.color_code,
      b.bench_date,
      EXTRACT(EPOCH FROM age(CURRENT_DATE, b.bench_date::date))::integer / 86400 as bench_duration_days,
      CASE 
        WHEN p.career_start_date IS NOT NULL THEN 
          ROUND(EXTRACT(EPOCH FROM age(CURRENT_DATE, p.career_start_date)) / 31536000.0, 1)
        ELSE NULL 
      END as total_years_experience,
      b.bench_feedback,
      CASE 
        WHEN EXISTS (
          SELECT 1 FROM resource_planning rp 
          WHERE rp.profile_id = p.id 
          AND rp.engagement_complete = false
          AND (
            rp.engagement_start_date IS NULL OR 
            rp.engagement_start_date <= CURRENT_DATE + INTERVAL '3 months'
          )
        ) THEN 'planned'
        ELSE 'unplanned'
      END as planned_status
    FROM bench b
    LEFT JOIN profiles p ON b.profile_id = p.id
    LEFT JOIN general_information gi ON p.id = gi.profile_id
    LEFT JOIN sbus s ON p.sbu_id = s.id
    LEFT JOIN expertise_types et ON p.expertise = et.id
    LEFT JOIN bill_types bt ON b.bill_type_id = bt.id
    WHERE EXTRACT(EPOCH FROM age(CURRENT_DATE, b.bench_date::date))::integer / 86400 >= risk_threshold_days
  ),
  risk_summary AS (
    SELECT 
      COUNT(*) as total_high_risk_count,
      COUNT(CASE WHEN bench_duration_days > 90 THEN 1 END) as critical_risk_count,
      COUNT(CASE WHEN planned_status = 'unplanned' THEN 1 END) as unplanned_high_risk_count,
      ROUND(AVG(bench_duration_days), 1) as avg_high_risk_duration,
      COUNT(CASE WHEN total_years_experience >= 8 THEN 1 END) as senior_high_risk_count
    FROM risk_profiles
  ),
  top_risk_sbus AS (
    SELECT 
      sbu_name,
      COUNT(*) as risk_count,
      ROUND(AVG(bench_duration_days), 1) as avg_duration
    FROM risk_profiles
    WHERE sbu_name IS NOT NULL
    GROUP BY sbu_name
    ORDER BY risk_count DESC
    LIMIT 5
  )
  SELECT json_build_object(
    'risk_summary', row_to_json(risk_summary.*),
    'high_risk_profiles', (
      SELECT json_agg(row_to_json(risk_profiles.*))
      FROM risk_profiles
      ORDER BY bench_duration_days DESC
      LIMIT 20
    ),
    'top_risk_sbus', (
      SELECT json_agg(row_to_json(top_risk_sbus.*))
      FROM top_risk_sbus
    )
  )
  INTO result_data
  FROM risk_summary;
  
  RETURN COALESCE(result_data, '{}'::json);
END;
$$;

-- 4. Bench Trends Analysis
CREATE OR REPLACE FUNCTION public.get_bench_trends_analysis(
  period_type text DEFAULT 'monthly', -- 'daily', 'weekly', 'monthly'
  lookback_days integer DEFAULT 365
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result_data json;
  date_trunc_format text;
BEGIN
  CASE period_type
    WHEN 'daily' THEN date_trunc_format := 'day';
    WHEN 'weekly' THEN date_trunc_format := 'week';
    ELSE date_trunc_format := 'month';
  END CASE;
  
  WITH trend_data AS (
    SELECT 
      date_trunc(date_trunc_format, b.bench_date::timestamp) as period_start,
      COUNT(*) as new_bench_count,
      COUNT(DISTINCT p.sbu_id) as affected_sbus,
      ROUND(AVG(
        CASE 
          WHEN p.career_start_date IS NOT NULL THEN 
            EXTRACT(EPOCH FROM age(b.bench_date::date, p.career_start_date)) / 31536000.0
          ELSE NULL 
        END
      ), 1) as avg_experience_of_new_bench
    FROM bench b
    LEFT JOIN profiles p ON b.profile_id = p.id
    WHERE b.bench_date >= CURRENT_DATE - INTERVAL '1 day' * lookback_days
    GROUP BY date_trunc(date_trunc_format, b.bench_date::timestamp)
    ORDER BY period_start DESC
  ),
  placement_velocity AS (
    SELECT 
      AVG(
        CASE 
          WHEN rp.engagement_start_date IS NOT NULL AND b.bench_date IS NOT NULL THEN
            EXTRACT(EPOCH FROM age(rp.engagement_start_date::timestamp, b.bench_date::timestamp))::integer / 86400
          ELSE NULL
        END
      ) as avg_days_to_placement
    FROM bench b
    LEFT JOIN resource_planning rp ON b.profile_id = rp.profile_id
    WHERE rp.engagement_start_date >= b.bench_date
      AND b.bench_date >= CURRENT_DATE - INTERVAL '1 day' * lookback_days
      AND rp.engagement_complete = false
  )
  SELECT json_build_object(
    'trends', (
      SELECT json_agg(
        json_build_object(
          'period', period_start,
          'new_bench_count', new_bench_count,
          'affected_sbus', affected_sbus,
          'avg_experience_of_new_bench', avg_experience_of_new_bench
        )
      )
      FROM trend_data
    ),
    'placement_metrics', row_to_json(placement_velocity.*)
  )
  INTO result_data
  FROM placement_velocity;
  
  RETURN COALESCE(result_data, '{}'::json);
END;
$$;