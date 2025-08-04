
CREATE OR REPLACE FUNCTION public.get_employee_profiles(
    search_query text DEFAULT NULL::text,
    skill_filter text DEFAULT NULL::text,
    experience_filter text DEFAULT NULL::text,
    education_filter text DEFAULT NULL::text,
    training_filter text DEFAULT NULL::text,
    achievement_filter text DEFAULT NULL::text,
    project_filter text DEFAULT NULL::text,
    min_experience_years integer DEFAULT NULL::integer,
    max_experience_years integer DEFAULT NULL::integer,
    min_graduation_year integer DEFAULT NULL::integer,
    max_graduation_year integer DEFAULT NULL::integer,
    completion_status text DEFAULT NULL::text,
    min_engagement_percentage real DEFAULT NULL::real,
    max_engagement_percentage real DEFAULT NULL::real,
    min_billing_percentage real DEFAULT NULL::real,
    max_billing_percentage real DEFAULT NULL::real,
    release_date_from text DEFAULT NULL::text,
    release_date_to text DEFAULT NULL::text,
    availability_status text DEFAULT NULL::text,
    current_project_search text DEFAULT NULL::text,
    page_number integer DEFAULT 1,
    items_per_page integer DEFAULT 10,
    sort_by text DEFAULT 'last_name'::text,
    sort_order text DEFAULT 'asc'::text
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
    base_query text;
    count_query text;
    total_count integer;
    filtered_count integer;
    result_data json;
    offset_val integer;
BEGIN
    -- Build base query with all filters
    base_query := 'FROM profiles p 
                   LEFT JOIN general_information gi ON p.id = gi.profile_id
                   LEFT JOIN sbus s ON p.sbu_id = s.id
                   LEFT JOIN expertise_types et ON p.expertise = et.id
                   LEFT JOIN resource_types rt ON p.resource_type = rt.id
                   LEFT JOIN resource_planning rp ON p.id = rp.profile_id
                   LEFT JOIN projects_management pm ON rp.project_id = pm.id
                   WHERE 1=1';

    -- Add search query filter
    IF search_query IS NOT NULL AND trim(search_query) != '' THEN
        base_query := base_query || ' AND (
            p.first_name ILIKE ' || quote_literal('%' || search_query || '%') || '
            OR p.last_name ILIKE ' || quote_literal('%' || search_query || '%') || '
            OR p.employee_id ILIKE ' || quote_literal('%' || search_query || '%') || '
            OR gi.first_name ILIKE ' || quote_literal('%' || search_query || '%') || '
            OR gi.last_name ILIKE ' || quote_literal('%' || search_query || '%') || '
            OR gi.current_designation ILIKE ' || quote_literal('%' || search_query || '%') || '
            OR gi.biography ILIKE ' || quote_literal('%' || search_query || '%') || '
            OR s.name ILIKE ' || quote_literal('%' || search_query || '%') || '
        )';
    END IF;

    -- Add skill filter
    IF skill_filter IS NOT NULL AND trim(skill_filter) != '' THEN
        base_query := base_query || ' AND EXISTS (
            SELECT 1 FROM technical_skills ts WHERE ts.profile_id = p.id 
            AND ts.name ILIKE ' || quote_literal('%' || skill_filter || '%') || '
            UNION
            SELECT 1 FROM specialized_skills ss WHERE ss.profile_id = p.id 
            AND ss.name ILIKE ' || quote_literal('%' || skill_filter || '%') || '
        )';
    END IF;

    -- Add experience filter
    IF experience_filter IS NOT NULL AND trim(experience_filter) != '' THEN
        base_query := base_query || ' AND EXISTS (
            SELECT 1 FROM experiences ex WHERE ex.profile_id = p.id 
            AND (ex.company_name ILIKE ' || quote_literal('%' || experience_filter || '%') || '
                 OR ex.designation ILIKE ' || quote_literal('%' || experience_filter || '%') || '
                 OR ex.description ILIKE ' || quote_literal('%' || experience_filter || '%') || ')
        )';
    END IF;

    -- Add education filter
    IF education_filter IS NOT NULL AND trim(education_filter) != '' THEN
        base_query := base_query || ' AND EXISTS (
            SELECT 1 FROM education ed WHERE ed.profile_id = p.id 
            AND (ed.university ILIKE ' || quote_literal('%' || education_filter || '%') || '
                 OR ed.degree ILIKE ' || quote_literal('%' || education_filter || '%') || '
                 OR ed.department ILIKE ' || quote_literal('%' || education_filter || '%') || ')
        )';
    END IF;

    -- Add training filter
    IF training_filter IS NOT NULL AND trim(training_filter) != '' THEN
        base_query := base_query || ' AND EXISTS (
            SELECT 1 FROM trainings tr WHERE tr.profile_id = p.id 
            AND (tr.title ILIKE ' || quote_literal('%' || training_filter || '%') || '
                 OR tr.provider ILIKE ' || quote_literal('%' || training_filter || '%') || '
                 OR tr.description ILIKE ' || quote_literal('%' || training_filter || '%') || ')
        )';
    END IF;

    -- Add achievement filter
    IF achievement_filter IS NOT NULL AND trim(achievement_filter) != '' THEN
        base_query := base_query || ' AND EXISTS (
            SELECT 1 FROM achievements ac WHERE ac.profile_id = p.id 
            AND (ac.title ILIKE ' || quote_literal('%' || achievement_filter || '%') || '
                 OR ac.description ILIKE ' || quote_literal('%' || achievement_filter || '%') || ')
        )';
    END IF;

    -- Add project filter (THIS IS THE NEW IMPLEMENTATION)
    IF project_filter IS NOT NULL AND trim(project_filter) != '' THEN
        base_query := base_query || ' AND EXISTS (
            SELECT 1 FROM projects pr WHERE pr.profile_id = p.id 
            AND (pr.name ILIKE ' || quote_literal('%' || project_filter || '%') || '
                 OR pr.description ILIKE ' || quote_literal('%' || project_filter || '%') || '
                 OR pr.responsibility ILIKE ' || quote_literal('%' || project_filter || '%') || '
                 OR pr.technologies_used::text ILIKE ' || quote_literal('%' || project_filter || '%') || ')
        )';
    END IF;

    -- Add experience years filters
    IF min_experience_years IS NOT NULL OR max_experience_years IS NOT NULL THEN
        base_query := base_query || ' AND EXISTS (
            SELECT 1 FROM (
                SELECT ex.profile_id,
                       SUM(CASE 
                           WHEN ex.is_current THEN 
                               EXTRACT(EPOCH FROM age(CURRENT_DATE, ex.start_date)) / 31536000.0
                           ELSE 
                               EXTRACT(EPOCH FROM age(COALESCE(ex.end_date, CURRENT_DATE), ex.start_date)) / 31536000.0
                       END) as total_years
                FROM experiences ex
                WHERE ex.start_date IS NOT NULL
                GROUP BY ex.profile_id
            ) exp_calc 
            WHERE exp_calc.profile_id = p.id';
        
        IF min_experience_years IS NOT NULL THEN
            base_query := base_query || ' AND exp_calc.total_years >= ' || min_experience_years;
        END IF;
        
        IF max_experience_years IS NOT NULL THEN
            base_query := base_query || ' AND exp_calc.total_years <= ' || max_experience_years;
        END IF;
        
        base_query := base_query || ')';
    END IF;

    -- Add graduation year filters
    IF min_graduation_year IS NOT NULL OR max_graduation_year IS NOT NULL THEN
        base_query := base_query || ' AND EXISTS (
            SELECT 1 FROM education ed WHERE ed.profile_id = p.id 
            AND ed.end_date IS NOT NULL';
        
        IF min_graduation_year IS NOT NULL THEN
            base_query := base_query || ' AND EXTRACT(YEAR FROM ed.end_date) >= ' || min_graduation_year;
        END IF;
        
        IF max_graduation_year IS NOT NULL THEN
            base_query := base_query || ' AND EXTRACT(YEAR FROM ed.end_date) <= ' || max_graduation_year;
        END IF;
        
        base_query := base_query || ')';
    END IF;

    -- Add completion status filter
    IF completion_status IS NOT NULL AND completion_status != 'all' THEN
        IF completion_status = 'complete' THEN
            base_query := base_query || ' AND (
                EXISTS (SELECT 1 FROM technical_skills ts WHERE ts.profile_id = p.id
                        UNION SELECT 1 FROM specialized_skills ss WHERE ss.profile_id = p.id)
                AND EXISTS (SELECT 1 FROM experiences ex WHERE ex.profile_id = p.id)
                AND EXISTS (SELECT 1 FROM education ed WHERE ed.profile_id = p.id)
                AND EXISTS (SELECT 1 FROM projects pr WHERE pr.profile_id = p.id)
            )';
        ELSIF completion_status = 'incomplete' THEN
            base_query := base_query || ' AND NOT (
                EXISTS (SELECT 1 FROM technical_skills ts WHERE ts.profile_id = p.id
                        UNION SELECT 1 FROM specialized_skills ss WHERE ss.profile_id = p.id)
                AND EXISTS (SELECT 1 FROM experiences ex WHERE ex.profile_id = p.id)
                AND EXISTS (SELECT 1 FROM education ed WHERE ed.profile_id = p.id)
                AND EXISTS (SELECT 1 FROM projects pr WHERE pr.profile_id = p.id)
            )';
        END IF;
    END IF;

    -- Add resource planning filters
    IF min_engagement_percentage IS NOT NULL THEN
        base_query := base_query || ' AND rp.engagement_percentage >= ' || min_engagement_percentage;
    END IF;

    IF max_engagement_percentage IS NOT NULL THEN
        base_query := base_query || ' AND rp.engagement_percentage <= ' || max_engagement_percentage;
    END IF;

    IF min_billing_percentage IS NOT NULL THEN
        base_query := base_query || ' AND rp.billing_percentage >= ' || min_billing_percentage;
    END IF;

    IF max_billing_percentage IS NOT NULL THEN
        base_query := base_query || ' AND rp.billing_percentage <= ' || max_billing_percentage;
    END IF;

    IF release_date_from IS NOT NULL THEN
        base_query := base_query || ' AND rp.release_date >= ' || quote_literal(release_date_from);
    END IF;

    IF release_date_to IS NOT NULL THEN
        base_query := base_query || ' AND rp.release_date <= ' || quote_literal(release_date_to);
    END IF;

    IF availability_status IS NOT NULL THEN
        IF availability_status = 'available' THEN
            base_query := base_query || ' AND (rp.engagement_complete = true OR rp.engagement_percentage IS NULL OR rp.engagement_percentage < 80)';
        ELSIF availability_status = 'engaged' THEN
            base_query := base_query || ' AND (rp.engagement_complete = false AND rp.engagement_percentage >= 80)';
        END IF;
    END IF;

    IF current_project_search IS NOT NULL AND trim(current_project_search) != '' THEN
        base_query := base_query || ' AND pm.project_name ILIKE ' || quote_literal('%' || current_project_search || '%');
    END IF;

    -- Get total count (without filters for reference)
    EXECUTE 'SELECT COUNT(DISTINCT p.id) FROM profiles p' INTO total_count;

    -- Get filtered count
    count_query := 'SELECT COUNT(DISTINCT p.id) ' || base_query;
    EXECUTE count_query INTO filtered_count;

    -- Calculate offset
    offset_val := (page_number - 1) * items_per_page;

    -- Build final query with pagination and sorting
    base_query := 'SELECT DISTINCT
        p.id,
        p.employee_id,
        COALESCE(gi.first_name, p.first_name) as first_name,
        COALESCE(gi.last_name, p.last_name) as last_name,
        gi.current_designation,
        gi.biography,
        gi.profile_image,
        s.name as sbu_name,
        et.name as expertise_type,
        rt.name as resource_type,
        rp.engagement_percentage,
        rp.billing_percentage,
        rp.release_date,
        pm.project_name as current_project,
        -- Calculate total experience years
        (SELECT SUM(
            CASE 
                WHEN ex.is_current THEN 
                    EXTRACT(EPOCH FROM age(CURRENT_DATE, ex.start_date)) / 31536000.0
                ELSE 
                    EXTRACT(EPOCH FROM age(COALESCE(ex.end_date, CURRENT_DATE), ex.start_date)) / 31536000.0
            END
        )
        FROM experiences ex
        WHERE ex.profile_id = p.id AND ex.start_date IS NOT NULL
        ) as total_experience_years
    ' || base_query;

    -- Add sorting
    IF sort_by = 'first_name' THEN
        base_query := base_query || ' ORDER BY COALESCE(gi.first_name, p.first_name) ' || sort_order;
    ELSIF sort_by = 'last_name' THEN
        base_query := base_query || ' ORDER BY COALESCE(gi.last_name, p.last_name) ' || sort_order;
    ELSIF sort_by = 'employee_id' THEN
        base_query := base_query || ' ORDER BY p.employee_id ' || sort_order;
    ELSIF sort_by = 'current_designation' THEN
        base_query := base_query || ' ORDER BY gi.current_designation ' || sort_order;
    ELSIF sort_by = 'sbu_name' THEN
        base_query := base_query || ' ORDER BY s.name ' || sort_order;
    ELSIF sort_by = 'experience_years' THEN
        base_query := base_query || ' ORDER BY total_experience_years ' || sort_order;
    ELSE
        base_query := base_query || ' ORDER BY COALESCE(gi.last_name, p.last_name) ASC';
    END IF;

    -- Add pagination
    base_query := base_query || ' LIMIT ' || items_per_page || ' OFFSET ' || offset_val;

    -- Execute final query and build result
    EXECUTE 'SELECT json_agg(row_to_json(t)) FROM (' || base_query || ') t' INTO result_data;

    -- Return final result
    RETURN json_build_object(
        'profiles', COALESCE(result_data, '[]'::json),
        'pagination', json_build_object(
            'total_count', total_count,
            'filtered_count', filtered_count,
            'page', page_number,
            'per_page', items_per_page,
            'page_count', CEIL(filtered_count::numeric / items_per_page)
        )
    );
END;
$function$
