-- Update get_non_billed_resources_overview_statistics to include bench analytics
CREATE OR REPLACE FUNCTION public.get_non_billed_resources_overview_statistics(
    start_date_filter text DEFAULT NULL,
    end_date_filter text DEFAULT NULL,
    sbu_filter text[] DEFAULT NULL,
    expertise_filter text[] DEFAULT NULL,
    bill_type_filter text[] DEFAULT NULL,
    bench_filter boolean DEFAULT NULL
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
    result json;
BEGIN
    WITH filtered_data AS (
        SELECT 
            nbr.*,
            p.id as profile_id,
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
            gi.first_name as display_first_name,
            gi.last_name as display_last_name,
            CASE 
                WHEN p.career_start_date IS NOT NULL THEN 
                    EXTRACT(EPOCH FROM age(CURRENT_DATE, p.career_start_date)) / 31536000.0
                ELSE 0
            END as experience_years,
            CASE 
                WHEN nbr.non_billed_resources_date IS NOT NULL THEN 
                    CURRENT_DATE - nbr.non_billed_resources_date
                ELSE 0
            END as non_billed_duration_days,
            -- Check if profile is in bench
            CASE WHEN bbt.bill_type IS NOT NULL THEN true ELSE false END as is_bench
        FROM non_billed_resources nbr
        LEFT JOIN profiles p ON nbr.profile_id = p.id
        LEFT JOIN general_information gi ON p.id = gi.profile_id
        LEFT JOIN sbus s ON p.sbu_id = s.id
        LEFT JOIN expertise_types et ON p.expertise = et.id
        LEFT JOIN bill_types bt ON nbr.bill_type_id = bt.id
        LEFT JOIN bench_bill_types bbt ON nbr.bill_type_id = bbt.bill_type
        WHERE p.active = true
            AND (start_date_filter IS NULL OR nbr.non_billed_resources_date >= start_date_filter::date)
            AND (end_date_filter IS NULL OR nbr.non_billed_resources_date <= end_date_filter::date)
            AND (sbu_filter IS NULL OR s.name = ANY(sbu_filter))
            AND (expertise_filter IS NULL OR et.name = ANY(expertise_filter))
            AND (bill_type_filter IS NULL OR bt.name = ANY(bill_type_filter))
            AND (bench_filter IS NULL OR 
                 (bench_filter = true AND bbt.bill_type IS NOT NULL) OR
                 (bench_filter = false AND bbt.bill_type IS NULL))
    ),
    overview_stats AS (
        SELECT
            COUNT(*) as total_non_billed_resources_count,
            COALESCE(AVG(non_billed_duration_days), 0) as avg_non_billed_resources_duration_days,
            COALESCE(MAX(non_billed_duration_days), 0) as max_non_billed_resources_duration_days,
            COALESCE(MIN(non_billed_duration_days), 0) as min_non_billed_resources_duration_days,
            COUNT(*) FILTER (WHERE non_billed_duration_days >= 30) as long_term_non_billed_resources_count,
            COUNT(*) FILTER (WHERE non_billed_duration_days >= 60) as critical_non_billed_resources_count,
            COALESCE(AVG(experience_years), 0) as avg_experience_years,
            -- Bench specific stats
            COUNT(*) FILTER (WHERE is_bench = true) as total_bench_count,
            COALESCE(AVG(non_billed_duration_days) FILTER (WHERE is_bench = true), 0) as avg_bench_duration_days,
            COUNT(*) FILTER (WHERE is_bench = true AND non_billed_duration_days < 30) as bench_initial_count,
            COUNT(*) FILTER (WHERE is_bench = true AND non_billed_duration_days >= 60) as bench_critical_count,
            COUNT(*) FILTER (WHERE is_bench = false AND non_billed_duration_days < 30) as non_bench_initial_count,
            COUNT(*) FILTER (WHERE is_bench = false AND non_billed_duration_days >= 60) as non_bench_critical_count
        FROM filtered_data
    ),
    experience_stats AS (
        SELECT
            COUNT(*) FILTER (WHERE experience_years < 3) as junior,
            COUNT(*) FILTER (WHERE experience_years >= 3 AND experience_years < 8) as mid,
            COUNT(*) FILTER (WHERE experience_years >= 8) as senior,
            COUNT(*) FILTER (WHERE experience_years = 0 OR experience_years IS NULL) as unknown
        FROM filtered_data
    ),
    recent_trends AS (
        SELECT
            COUNT(*) FILTER (WHERE non_billed_resources_date >= CURRENT_DATE - INTERVAL '7 days') as new_non_billed_resources_last_7_days,
            COUNT(*) FILTER (WHERE non_billed_resources_date >= CURRENT_DATE - INTERVAL '30 days') as new_non_billed_resources_last_30_days
        FROM filtered_data
    )
    SELECT json_build_object(
        'overview', json_build_object(
            'total_non_billed_resources_count', os.total_non_billed_resources_count,
            'avg_non_billed_resources_duration_days', ROUND(os.avg_non_billed_resources_duration_days, 1),
            'max_non_billed_resources_duration_days', os.max_non_billed_resources_duration_days,
            'min_non_billed_resources_duration_days', os.min_non_billed_resources_duration_days,
            'long_term_non_billed_resources_count', os.long_term_non_billed_resources_count,
            'critical_non_billed_resources_count', os.critical_non_billed_resources_count,
            'avg_experience_years', ROUND(os.avg_experience_years, 1),
            'total_bench_count', os.total_bench_count,
            'avg_bench_duration_days', ROUND(os.avg_bench_duration_days, 1),
            'bench_initial_count', os.bench_initial_count,
            'bench_critical_count', os.bench_critical_count,
            'non_bench_initial_count', os.non_bench_initial_count,
            'non_bench_critical_count', os.non_bench_critical_count
        ),
        'experience_distribution', json_build_object(
            'junior', es.junior,
            'mid', es.mid,
            'senior', es.senior,
            'unknown', es.unknown
        ),
        'recent_trends', json_build_object(
            'new_non_billed_resources_last_7_days', rt.new_non_billed_resources_last_7_days,
            'new_non_billed_resources_last_30_days', rt.new_non_billed_resources_last_30_days
        )
    ) INTO result
    FROM overview_stats os, experience_stats es, recent_trends rt;
    
    RETURN result;
END;
$function$;

-- Update get_non_billed_resources_dimensional_analysis to include bench filter
CREATE OR REPLACE FUNCTION public.get_non_billed_resources_dimensional_analysis(
    start_date_filter text DEFAULT NULL,
    end_date_filter text DEFAULT NULL,
    group_by_dimension text DEFAULT 'sbu',
    bench_filter boolean DEFAULT NULL
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
    result json;
BEGIN
    WITH filtered_data AS (
        SELECT 
            nbr.*,
            p.id as profile_id,
            p.sbu_id,
            p.expertise,
            p.career_start_date,
            s.name as sbu_name,
            et.name as expertise_name,
            bt.name as bill_type_name,
            bt.color_code,
            CASE 
                WHEN p.career_start_date IS NOT NULL THEN 
                    EXTRACT(EPOCH FROM age(CURRENT_DATE, p.career_start_date)) / 31536000.0
                ELSE 0
            END as experience_years,
            CASE 
                WHEN nbr.non_billed_resources_date IS NOT NULL THEN 
                    CURRENT_DATE - nbr.non_billed_resources_date
                ELSE 0
            END as non_billed_duration_days,
            -- Check if profile is in bench
            CASE WHEN bbt.bill_type IS NOT NULL THEN true ELSE false END as is_bench
        FROM non_billed_resources nbr
        LEFT JOIN profiles p ON nbr.profile_id = p.id
        LEFT JOIN sbus s ON p.sbu_id = s.id
        LEFT JOIN expertise_types et ON p.expertise = et.id
        LEFT JOIN bill_types bt ON nbr.bill_type_id = bt.id
        LEFT JOIN bench_bill_types bbt ON nbr.bill_type_id = bbt.bill_type
        WHERE p.active = true
            AND (start_date_filter IS NULL OR nbr.non_billed_resources_date >= start_date_filter::date)
            AND (end_date_filter IS NULL OR nbr.non_billed_resources_date <= end_date_filter::date)
            AND (bench_filter IS NULL OR 
                 (bench_filter = true AND bbt.bill_type IS NOT NULL) OR
                 (bench_filter = false AND bbt.bill_type IS NULL))
    )
    SELECT json_agg(
        json_build_object(
            'dimension_id', 
            CASE 
                WHEN group_by_dimension = 'sbu' THEN sbu_id::text
                WHEN group_by_dimension = 'expertise' THEN expertise::text
                WHEN group_by_dimension = 'bill_type' THEN bill_type_id::text
            END,
            'dimension_name',
            CASE 
                WHEN group_by_dimension = 'sbu' THEN sbu_name
                WHEN group_by_dimension = 'expertise' THEN expertise_name
                WHEN group_by_dimension = 'bill_type' THEN bill_type_name
            END,
            'total_count', count(*),
            'avg_duration_days', ROUND(AVG(non_billed_duration_days), 1),
            'long_term_count', COUNT(*) FILTER (WHERE non_billed_duration_days >= 30),
            'avg_experience_years', ROUND(AVG(experience_years), 1),
            'color_code', 
            CASE 
                WHEN group_by_dimension = 'bill_type' THEN color_code
                ELSE '#FFFFFF'
            END
        )
    ) INTO result
    FROM filtered_data
    WHERE 
        CASE 
            WHEN group_by_dimension = 'sbu' THEN sbu_name IS NOT NULL
            WHEN group_by_dimension = 'expertise' THEN expertise_name IS NOT NULL
            WHEN group_by_dimension = 'bill_type' THEN bill_type_name IS NOT NULL
        END
    GROUP BY 
        CASE 
            WHEN group_by_dimension = 'sbu' THEN sbu_id
            WHEN group_by_dimension = 'expertise' THEN expertise
            WHEN group_by_dimension = 'bill_type' THEN bill_type_id
        END,
        CASE 
            WHEN group_by_dimension = 'sbu' THEN sbu_name
            WHEN group_by_dimension = 'expertise' THEN expertise_name
            WHEN group_by_dimension = 'bill_type' THEN bill_type_name
        END,
        CASE 
            WHEN group_by_dimension = 'bill_type' THEN color_code
            ELSE '#FFFFFF'
        END
    ORDER BY count(*) DESC;
    
    RETURN COALESCE(result, '[]'::json);
END;
$function$;

-- Update get_non_billed_resources_risk_analytics to include bench filter and update critical threshold
CREATE OR REPLACE FUNCTION public.get_non_billed_resources_risk_analytics(
    risk_threshold_days integer DEFAULT 30,
    bench_filter boolean DEFAULT NULL
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
    result json;
BEGIN
    WITH filtered_data AS (
        SELECT 
            nbr.*,
            p.id as profile_id,
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
            gi.first_name as display_first_name,
            gi.last_name as display_last_name,
            CASE 
                WHEN p.career_start_date IS NOT NULL THEN 
                    EXTRACT(EPOCH FROM age(CURRENT_DATE, p.career_start_date)) / 31536000.0
                ELSE 0
            END as experience_years,
            CASE 
                WHEN nbr.non_billed_resources_date IS NOT NULL THEN 
                    CURRENT_DATE - nbr.non_billed_resources_date
                ELSE 0
            END as non_billed_duration_days,
            -- Check if profile is in bench
            CASE WHEN bbt.bill_type IS NOT NULL THEN true ELSE false END as is_bench,
            -- Determine planned status from feedback
            CASE 
                WHEN nbr.non_billed_resources_feedback ILIKE '%planned%' OR 
                     nbr.non_billed_resources_feedback ILIKE '%pipeline%' THEN 'planned'
                ELSE 'unplanned'
            END as planned_status
        FROM non_billed_resources nbr
        LEFT JOIN profiles p ON nbr.profile_id = p.id
        LEFT JOIN general_information gi ON p.id = gi.profile_id
        LEFT JOIN sbus s ON p.sbu_id = s.id
        LEFT JOIN expertise_types et ON p.expertise = et.id
        LEFT JOIN bill_types bt ON nbr.bill_type_id = bt.id
        LEFT JOIN bench_bill_types bbt ON nbr.bill_type_id = bbt.bill_type
        WHERE p.active = true
            AND (bench_filter IS NULL OR 
                 (bench_filter = true AND bbt.bill_type IS NOT NULL) OR
                 (bench_filter = false AND bbt.bill_type IS NULL))
    ),
    risk_summary AS (
        SELECT
            COUNT(*) FILTER (WHERE non_billed_duration_days >= risk_threshold_days) as total_high_risk_count,
            COUNT(*) FILTER (WHERE non_billed_duration_days >= 60) as critical_risk_count,
            COUNT(*) FILTER (WHERE non_billed_duration_days >= risk_threshold_days AND planned_status = 'unplanned') as unplanned_high_risk_count,
            COALESCE(AVG(non_billed_duration_days) FILTER (WHERE non_billed_duration_days >= risk_threshold_days), 0) as avg_high_risk_duration,
            COUNT(*) FILTER (WHERE non_billed_duration_days >= risk_threshold_days AND experience_years >= 8) as senior_high_risk_count
        FROM filtered_data
    ),
    high_risk_profiles AS (
        SELECT json_agg(
            json_build_object(
                'profile_id', profile_id,
                'employee_id', employee_id,
                'first_name', COALESCE(display_first_name, first_name),
                'last_name', COALESCE(display_last_name, last_name),
                'sbu_name', sbu_name,
                'expertise_name', expertise_name,
                'bill_type_name', bill_type_name,
                'color_code', color_code,
                'non_billed_resources_date', non_billed_resources_date,
                'non_billed_resources_duration_days', non_billed_duration_days,
                'total_years_experience', ROUND(experience_years, 1),
                'non_billed_resources_feedback', non_billed_resources_feedback,
                'planned_status', planned_status
            )
        ) as profiles
        FROM filtered_data
        WHERE non_billed_duration_days >= risk_threshold_days
        ORDER BY non_billed_duration_days DESC
    ),
    top_risk_sbus AS (
        SELECT json_agg(
            json_build_object(
                'sbu_name', sbu_name,
                'risk_count', risk_count,
                'avg_duration', avg_duration
            )
        ) as sbus
        FROM (
            SELECT 
                sbu_name,
                COUNT(*) as risk_count,
                ROUND(AVG(non_billed_duration_days), 1) as avg_duration
            FROM filtered_data
            WHERE non_billed_duration_days >= risk_threshold_days
                AND sbu_name IS NOT NULL
            GROUP BY sbu_name
            ORDER BY COUNT(*) DESC
            LIMIT 10
        ) t
    )
    SELECT json_build_object(
        'risk_summary', json_build_object(
            'total_high_risk_count', rs.total_high_risk_count,
            'critical_risk_count', rs.critical_risk_count,
            'unplanned_high_risk_count', rs.unplanned_high_risk_count,
            'avg_high_risk_duration', ROUND(rs.avg_high_risk_duration, 1),
            'senior_high_risk_count', rs.senior_high_risk_count
        ),
        'high_risk_profiles', COALESCE(hrp.profiles, '[]'::json),
        'top_risk_sbus', COALESCE(trs.sbus, '[]'::json)
    ) INTO result
    FROM risk_summary rs, high_risk_profiles hrp, top_risk_sbus trs;
    
    RETURN result;
END;
$function$;

-- Update get_non_billed_resources_trends_analysis to include bench filter
CREATE OR REPLACE FUNCTION public.get_non_billed_resources_trends_analysis(
    period_type text DEFAULT 'monthly',
    lookback_days integer DEFAULT 365,
    bench_filter boolean DEFAULT NULL
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
    result json;
BEGIN
    WITH filtered_data AS (
        SELECT 
            nbr.*,
            p.id as profile_id,
            p.sbu_id,
            p.career_start_date,
            s.name as sbu_name,
            CASE 
                WHEN p.career_start_date IS NOT NULL THEN 
                    EXTRACT(EPOCH FROM age(CURRENT_DATE, p.career_start_date)) / 31536000.0
                ELSE 0
            END as experience_years,
            -- Check if profile is in bench
            CASE WHEN bbt.bill_type IS NOT NULL THEN true ELSE false END as is_bench
        FROM non_billed_resources nbr
        LEFT JOIN profiles p ON nbr.profile_id = p.id
        LEFT JOIN sbus s ON p.sbu_id = s.id
        LEFT JOIN bench_bill_types bbt ON nbr.bill_type_id = bbt.bill_type
        WHERE p.active = true
            AND nbr.non_billed_resources_date >= CURRENT_DATE - INTERVAL '1 day' * lookback_days
            AND (bench_filter IS NULL OR 
                 (bench_filter = true AND bbt.bill_type IS NOT NULL) OR
                 (bench_filter = false AND bbt.bill_type IS NULL))
    ),
    trends_data AS (
        SELECT
            CASE 
                WHEN period_type = 'daily' THEN non_billed_resources_date::text
                WHEN period_type = 'weekly' THEN TO_CHAR(DATE_TRUNC('week', non_billed_resources_date), 'YYYY-MM-DD')
                WHEN period_type = 'monthly' THEN TO_CHAR(DATE_TRUNC('month', non_billed_resources_date), 'YYYY-MM')
            END as period,
            COUNT(*) as new_non_billed_resources_count,
            COUNT(DISTINCT sbu_id) as affected_sbus,
            COALESCE(AVG(experience_years), 0) as avg_experience_of_new_non_billed_resources
        FROM filtered_data
        WHERE non_billed_resources_date IS NOT NULL
        GROUP BY 
            CASE 
                WHEN period_type = 'daily' THEN non_billed_resources_date::text
                WHEN period_type = 'weekly' THEN TO_CHAR(DATE_TRUNC('week', non_billed_resources_date), 'YYYY-MM-DD')
                WHEN period_type = 'monthly' THEN TO_CHAR(DATE_TRUNC('month', non_billed_resources_date), 'YYYY-MM')
            END
        ORDER BY period
    ),
    placement_metrics AS (
        SELECT 
            COALESCE(AVG(CURRENT_DATE - non_billed_resources_date), 0) as avg_days_to_placement
        FROM filtered_data
        WHERE non_billed_resources_date IS NOT NULL
    )
    SELECT json_build_object(
        'trends', COALESCE(json_agg(
            json_build_object(
                'period', td.period,
                'new_non_billed_resources_count', td.new_non_billed_resources_count,
                'affected_sbus', td.affected_sbus,
                'avg_experience_of_new_non_billed_resources', ROUND(td.avg_experience_of_new_non_billed_resources, 1)
            )
        ), '[]'::json),
        'placement_metrics', json_build_object(
            'avg_days_to_placement', ROUND(pm.avg_days_to_placement, 1)
        )
    ) INTO result
    FROM trends_data td, placement_metrics pm;
    
    RETURN result;
END;
$function$;