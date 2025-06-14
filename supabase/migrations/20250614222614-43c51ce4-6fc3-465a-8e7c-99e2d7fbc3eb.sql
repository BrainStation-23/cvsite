
-- Fix the experience distribution function to properly calculate total experience per person
CREATE OR REPLACE FUNCTION public.get_experience_distribution()
 RETURNS TABLE(range text, count bigint)
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  RETURN QUERY
  WITH person_total_experience AS (
    -- Calculate total experience years for each person across all their jobs
    SELECT 
      e.profile_id,
      SUM(
        CASE 
          WHEN e.is_current THEN 
            EXTRACT(EPOCH FROM age(CURRENT_DATE, e.start_date)) / 31536000.0
          ELSE 
            EXTRACT(EPOCH FROM age(COALESCE(e.end_date, CURRENT_DATE), e.start_date)) / 31536000.0
        END
      ) as total_years
    FROM experiences e
    WHERE e.start_date IS NOT NULL
    GROUP BY e.profile_id
  ),
  experience_ranges AS (
    SELECT 
      CASE 
        WHEN total_years < 1 THEN '0-1 years'
        WHEN total_years < 3 THEN '1-3 years'
        WHEN total_years < 5 THEN '3-5 years'
        WHEN total_years < 8 THEN '5-8 years'
        ELSE '8+ years'
      END as range
    FROM person_total_experience
  )
  SELECT 
    er.range,
    COUNT(*) as count
  FROM experience_ranges er
  GROUP BY er.range
  ORDER BY 
    CASE er.range
      WHEN '0-1 years' THEN 1
      WHEN '1-3 years' THEN 2
      WHEN '3-5 years' THEN 3
      WHEN '5-8 years' THEN 4
      WHEN '8+ years' THEN 5
    END;
END;
$function$
