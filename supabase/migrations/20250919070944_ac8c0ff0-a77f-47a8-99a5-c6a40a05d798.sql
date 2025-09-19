-- Create new non-billed pivot statistics RPC function
CREATE OR REPLACE FUNCTION public.get_non_billed_pivot_statistics_with_grouping(
  primary_dimension text DEFAULT 'sbu',
  secondary_dimension text DEFAULT 'bill_type',
  sbu_filter uuid DEFAULT NULL,
  bill_type_filter uuid DEFAULT NULL,
  expertise_type_filter uuid DEFAULT NULL,
  start_date_filter date DEFAULT NULL,
  end_date_filter date DEFAULT NULL,
  enable_grouping boolean DEFAULT false
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result_json json;
  pivot_data json[] := '{}';
  row_totals json[] := '{}';
  col_totals json[] := '{}';
  grand_total_count integer := 0;
  grand_total_avg_duration numeric := 0;
  grand_total_initial integer := 0;
  grand_total_critical integer := 0;
  
  -- For grouping
  row_groups text[] := '{}';
  col_groups text[] := '{}';
  
  -- Temporary variables
  rec record;
  row_dim_value text;
  col_dim_value text;
  row_group_value text;
  col_group_value text;
BEGIN
  -- Build the main query dynamically
  FOR rec IN 
    EXECUTE format('
      WITH base_data AS (
        SELECT 
          nbr.profile_id,
          nbr.non_billed_resources_date,
          CASE WHEN nbr.non_billed_resources_date IS NOT NULL 
               THEN CURRENT_DATE - nbr.non_billed_resources_date 
               ELSE 0 END as bench_duration_days,
          
          -- Primary dimension values
          CASE 
            WHEN %L = ''sbu'' THEN COALESCE(s.name, ''Unknown'')
            WHEN %L = ''bill_type'' THEN COALESCE(bt.name, ''Unknown'')
            WHEN %L = ''expertise'' THEN COALESCE(et.name, ''Unknown'')
            WHEN %L = ''experience_level'' THEN 
              CASE 
                WHEN p.career_start_date IS NULL THEN ''Unknown''
                WHEN EXTRACT(YEAR FROM AGE(CURRENT_DATE, p.career_start_date)) < 2 THEN ''Junior''
                WHEN EXTRACT(YEAR FROM AGE(CURRENT_DATE, p.career_start_date)) < 5 THEN ''Mid''
                WHEN EXTRACT(YEAR FROM AGE(CURRENT_DATE, p.career_start_date)) < 8 THEN ''Senior''
                ELSE ''Lead''
              END
            ELSE ''Unknown''
          END as primary_dim_value,
          
          -- Secondary dimension values  
          CASE 
            WHEN %L = ''sbu'' THEN COALESCE(s.name, ''Unknown'')
            WHEN %L = ''bill_type'' THEN COALESCE(bt.name, ''Unknown'')
            WHEN %L = ''expertise'' THEN COALESCE(et.name, ''Unknown'')
            WHEN %L = ''experience_level'' THEN 
              CASE 
                WHEN p.career_start_date IS NULL THEN ''Unknown''
                WHEN EXTRACT(YEAR FROM AGE(CURRENT_DATE, p.career_start_date)) < 2 THEN ''Junior''
                WHEN EXTRACT(YEAR FROM AGE(CURRENT_DATE, p.career_start_date)) < 5 THEN ''Mid''
                WHEN EXTRACT(YEAR FROM AGE(CURRENT_DATE, p.career_start_date)) < 8 THEN ''Senior''
                ELSE ''Lead''
              END
            ELSE ''Unknown''
          END as secondary_dim_value,
          
          -- Grouping values for primary dimension
          CASE 
            WHEN %L = ''sbu'' THEN 
              CASE WHEN s.is_department = true THEN ''Departments'' ELSE ''Business Units'' END
            WHEN %L = ''bill_type'' THEN
              CASE 
                WHEN bt.is_billable = true THEN ''Billable''
                WHEN bt.non_billed = true THEN ''Non-Billable''
                WHEN bt.is_support = true THEN ''Support''
                ELSE ''Other''
              END
            WHEN %L = ''expertise'' THEN ''Technical Expertise''
            WHEN %L = ''experience_level'' THEN ''Experience Levels''
            ELSE ''Default Group''
          END as primary_group,
          
          -- Grouping values for secondary dimension
          CASE 
            WHEN %L = ''sbu'' THEN 
              CASE WHEN s.is_department = true THEN ''Departments'' ELSE ''Business Units'' END
            WHEN %L = ''bill_type'' THEN
              CASE 
                WHEN bt.is_billable = true THEN ''Billable''
                WHEN bt.non_billed = true THEN ''Non-Billable''
                WHEN bt.is_support = true THEN ''Support''
                ELSE ''Other''
              END
            WHEN %L = ''expertise'' THEN ''Technical Expertise''
            WHEN %L = ''experience_level'' THEN ''Experience Levels''
            ELSE ''Default Group''
          END as secondary_group
          
        FROM non_billed_resources nbr
        LEFT JOIN profiles p ON nbr.profile_id = p.id
        LEFT JOIN sbus s ON p.sbu_id = s.id
        LEFT JOIN bill_types bt ON nbr.bill_type_id = bt.id
        LEFT JOIN expertise_types et ON p.expertise = et.id
        WHERE p.active = true
          AND (%L IS NULL OR p.sbu_id = %L)
          AND (%L IS NULL OR nbr.bill_type_id = %L)
          AND (%L IS NULL OR p.expertise = %L)
          AND (%L IS NULL OR nbr.non_billed_resources_date >= %L)
          AND (%L IS NULL OR nbr.non_billed_resources_date <= %L)
      ),
      aggregated_data AS (
        SELECT 
          primary_dim_value as row_dimension,
          secondary_dim_value as col_dimension,
          primary_group as row_group,
          secondary_group as col_group,
          COUNT(*) as count,
          COALESCE(AVG(bench_duration_days), 0)::numeric(10,2) as avg_duration,
          COUNT(CASE WHEN bench_duration_days < 30 THEN 1 END) as initial_count,
          COUNT(CASE WHEN bench_duration_days > 60 THEN 1 END) as critical_count
        FROM base_data
        GROUP BY primary_dim_value, secondary_dim_value, primary_group, secondary_group
      )
      SELECT * FROM aggregated_data
      ORDER BY row_dimension, col_dimension',
      primary_dimension, primary_dimension, primary_dimension, primary_dimension,
      secondary_dimension, secondary_dimension, secondary_dimension, secondary_dimension,
      primary_dimension, primary_dimension, primary_dimension, primary_dimension,
      secondary_dimension, secondary_dimension, secondary_dimension, secondary_dimension,
      sbu_filter, sbu_filter,
      bill_type_filter, bill_type_filter,
      expertise_type_filter, expertise_type_filter,
      start_date_filter, start_date_filter,
      end_date_filter, end_date_filter
    )
  LOOP
    -- Build pivot data
    pivot_data := pivot_data || json_build_object(
      'row_dimension', rec.row_dimension,
      'col_dimension', rec.col_dimension,
      'count', rec.count,
      'avg_duration', rec.avg_duration,
      'initial_count', rec.initial_count,
      'critical_count', rec.critical_count,
      'row_group', CASE WHEN enable_grouping THEN rec.row_group ELSE NULL END,
      'col_group', CASE WHEN enable_grouping THEN rec.col_group ELSE NULL END
    );
    
    -- Collect groups if grouping is enabled
    IF enable_grouping THEN
      IF NOT (rec.row_group = ANY(row_groups)) THEN
        row_groups := row_groups || rec.row_group;
      END IF;
      IF NOT (rec.col_group = ANY(col_groups)) THEN
        col_groups := col_groups || rec.col_group;
      END IF;
    END IF;
    
    -- Add to grand totals
    grand_total_count := grand_total_count + rec.count;
    grand_total_initial := grand_total_initial + rec.initial_count;
    grand_total_critical := grand_total_critical + rec.critical_count;
  END LOOP;
  
  -- Calculate grand total average duration
  IF grand_total_count > 0 THEN
    SELECT AVG(
      CASE WHEN nbr.non_billed_resources_date IS NOT NULL 
           THEN CURRENT_DATE - nbr.non_billed_resources_date 
           ELSE 0 END
    )::numeric(10,2)
    INTO grand_total_avg_duration
    FROM non_billed_resources nbr
    LEFT JOIN profiles p ON nbr.profile_id = p.id
    WHERE p.active = true
      AND (sbu_filter IS NULL OR p.sbu_id = sbu_filter)
      AND (bill_type_filter IS NULL OR nbr.bill_type_id = bill_type_filter)
      AND (expertise_type_filter IS NULL OR p.expertise = expertise_type_filter)
      AND (start_date_filter IS NULL OR nbr.non_billed_resources_date >= start_date_filter)
      AND (end_date_filter IS NULL OR nbr.non_billed_resources_date <= end_date_filter);
  END IF;
  
  -- Calculate row totals
  FOR rec IN 
    SELECT 
      row_dimension,
      row_group,
      SUM(count) as total_count,
      AVG(avg_duration)::numeric(10,2) as total_avg_duration,
      SUM(initial_count) as total_initial,
      SUM(critical_count) as total_critical
    FROM (
      SELECT 
        (json_array_elements(array_to_json(pivot_data))->>'row_dimension')::text as row_dimension,
        (json_array_elements(array_to_json(pivot_data))->>'row_group')::text as row_group,
        (json_array_elements(array_to_json(pivot_data))->>'count')::integer as count,
        (json_array_elements(array_to_json(pivot_data))->>'avg_duration')::numeric as avg_duration,
        (json_array_elements(array_to_json(pivot_data))->>'initial_count')::integer as initial_count,
        (json_array_elements(array_to_json(pivot_data))->>'critical_count')::integer as critical_count
    ) subq
    GROUP BY row_dimension, row_group
  LOOP
    row_totals := row_totals || json_build_object(
      'dimension', rec.row_dimension,
      'total', rec.total_count,
      'avg_duration', rec.total_avg_duration,
      'initial_count', rec.total_initial,
      'critical_count', rec.total_critical,
      'group_name', CASE WHEN enable_grouping THEN rec.row_group ELSE NULL END
    );
  END LOOP;
  
  -- Calculate column totals
  FOR rec IN 
    SELECT 
      col_dimension,
      col_group,
      SUM(count) as total_count,
      AVG(avg_duration)::numeric(10,2) as total_avg_duration,
      SUM(initial_count) as total_initial,
      SUM(critical_count) as total_critical
    FROM (
      SELECT 
        (json_array_elements(array_to_json(pivot_data))->>'col_dimension')::text as col_dimension,
        (json_array_elements(array_to_json(pivot_data))->>'col_group')::text as col_group,
        (json_array_elements(array_to_json(pivot_data))->>'count')::integer as count,
        (json_array_elements(array_to_json(pivot_data))->>'avg_duration')::numeric as avg_duration,
        (json_array_elements(array_to_json(pivot_data))->>'initial_count')::integer as initial_count,
        (json_array_elements(array_to_json(pivot_data))->>'critical_count')::integer as critical_count
    ) subq
    GROUP BY col_dimension, col_group
  LOOP
    col_totals := col_totals || json_build_object(
      'dimension', rec.col_dimension,
      'total', rec.total_count,
      'avg_duration', rec.total_avg_duration,
      'initial_count', rec.total_initial,
      'critical_count', rec.total_critical,
      'group_name', CASE WHEN enable_grouping THEN rec.col_group ELSE NULL END
    );
  END LOOP;
  
  -- Build final result
  result_json := json_build_object(
    'pivot_data', array_to_json(pivot_data),
    'row_totals', array_to_json(row_totals),
    'col_totals', array_to_json(col_totals),
    'grand_total', json_build_object(
      'count', grand_total_count,
      'avg_duration', grand_total_avg_duration,
      'initial_count', grand_total_initial,
      'critical_count', grand_total_critical
    ),
    'dimensions', json_build_object(
      'primary', primary_dimension,
      'secondary', secondary_dimension
    ),
    'grouping', json_build_object(
      'enabled', enable_grouping,
      'info', json_build_object(
        'row_groups', CASE WHEN enable_grouping THEN array_to_json(row_groups) ELSE NULL END,
        'col_groups', CASE WHEN enable_grouping THEN array_to_json(col_groups) ELSE NULL END
      )
    )
  );
  
  RETURN result_json;
END;
$$;