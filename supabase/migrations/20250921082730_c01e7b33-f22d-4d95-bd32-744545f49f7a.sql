-- Create RPC function for non-billed resources SBU dimensional analysis
CREATE OR REPLACE FUNCTION public.get_non_billed_resources_sbu_dimensional_analysis(
  start_date_filter date DEFAULT NULL,
  end_date_filter date DEFAULT NULL,
  bench_filter boolean DEFAULT NULL
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  expertise_analysis json;
  bill_type_analysis json;
  result_json json;
BEGIN
  -- Get expertise analysis grouped by SBU
  WITH expertise_data AS (
    SELECT 
      s.id as sbu_id,
      s.name as sbu_name,
      s.color_code as sbu_color_code,
      et.id as expertise_id,
      et.name as expertise_name,
      COUNT(*) as total_count,
      COUNT(*) FILTER (
        WHERE CURRENT_DATE - nbr.non_billed_resources_date <= 30
      ) as initial_count,
      COUNT(*) FILTER (
        WHERE CURRENT_DATE - nbr.non_billed_resources_date > 60
      ) as critical_count
    FROM non_billed_resources nbr
    JOIN profiles p ON nbr.profile_id = p.id
    JOIN sbus s ON p.sbu_id = s.id
    LEFT JOIN expertise_types et ON p.expertise = et.id
    WHERE 
      (start_date_filter IS NULL OR nbr.non_billed_resources_date >= start_date_filter)
      AND (end_date_filter IS NULL OR nbr.non_billed_resources_date <= end_date_filter)
      AND (
        bench_filter IS NULL 
        OR (
          bench_filter = true AND EXISTS (
            SELECT 1 FROM bench_bill_types bbt WHERE bbt.bill_type = nbr.bill_type_id
          )
        )
        OR (
          bench_filter = false AND NOT EXISTS (
            SELECT 1 FROM bench_bill_types bbt WHERE bbt.bill_type = nbr.bill_type_id
          )
        )
      )
    GROUP BY s.id, s.name, s.color_code, et.id, et.name
    ORDER BY s.name, et.name
  )
  SELECT json_agg(
    json_build_object(
      'sbu_id', sbu_id,
      'sbu_name', sbu_name,
      'sbu_color_code', sbu_color_code,
      'expertise_id', expertise_id,
      'expertise_name', COALESCE(expertise_name, 'Unknown'),
      'total_count', total_count,
      'initial_count', initial_count,
      'critical_count', critical_count
    )
  ) INTO expertise_analysis
  FROM expertise_data;

  -- Get bill type analysis grouped by SBU
  WITH bill_type_data AS (
    SELECT 
      s.id as sbu_id,
      s.name as sbu_name,
      s.color_code as sbu_color_code,
      bt.id as bill_type_id,
      bt.name as bill_type_name,
      bt.color_code as bill_type_color_code,
      COUNT(*) as total_count,
      COUNT(*) FILTER (
        WHERE CURRENT_DATE - nbr.non_billed_resources_date <= 30
      ) as initial_count,
      COUNT(*) FILTER (
        WHERE CURRENT_DATE - nbr.non_billed_resources_date > 60
      ) as critical_count
    FROM non_billed_resources nbr
    JOIN profiles p ON nbr.profile_id = p.id
    JOIN sbus s ON p.sbu_id = s.id
    LEFT JOIN bill_types bt ON nbr.bill_type_id = bt.id
    WHERE 
      (start_date_filter IS NULL OR nbr.non_billed_resources_date >= start_date_filter)
      AND (end_date_filter IS NULL OR nbr.non_billed_resources_date <= end_date_filter)
      AND (
        bench_filter IS NULL 
        OR (
          bench_filter = true AND EXISTS (
            SELECT 1 FROM bench_bill_types bbt WHERE bbt.bill_type = nbr.bill_type_id
          )
        )
        OR (
          bench_filter = false AND NOT EXISTS (
            SELECT 1 FROM bench_bill_types bbt WHERE bbt.bill_type = nbr.bill_type_id
          )
        )
      )
    GROUP BY s.id, s.name, s.color_code, bt.id, bt.name, bt.color_code
    ORDER BY s.name, bt.name
  )
  SELECT json_agg(
    json_build_object(
      'sbu_id', sbu_id,
      'sbu_name', sbu_name,
      'sbu_color_code', sbu_color_code,
      'bill_type_id', bill_type_id,
      'bill_type_name', COALESCE(bill_type_name, 'Unknown'),
      'bill_type_color_code', bill_type_color_code,
      'total_count', total_count,
      'initial_count', initial_count,
      'critical_count', critical_count
    )
  ) INTO bill_type_analysis
  FROM bill_type_data;

  -- Build final result
  result_json := json_build_object(
    'expertise_analysis', COALESCE(expertise_analysis, '[]'::json),
    'bill_type_analysis', COALESCE(bill_type_analysis, '[]'::json)
  );

  RETURN result_json;
END;
$$;