
-- Drop the existing search_projects function
DROP FUNCTION IF EXISTS public.search_projects(text, integer, integer, text, text);

-- Create the new enhanced search_projects function
CREATE OR REPLACE FUNCTION public.search_projects(
  search_query text DEFAULT NULL::text,
  page_number integer DEFAULT 1,
  items_per_page integer DEFAULT 10,
  sort_by text DEFAULT 'project_name'::text,
  sort_order text DEFAULT 'asc'::text,
  -- New filter parameters
  show_inactive_projects boolean DEFAULT false,
  project_type_filter uuid DEFAULT NULL::uuid,
  project_level_filter text DEFAULT NULL::text,
  budget_min numeric DEFAULT NULL::numeric,
  budget_max numeric DEFAULT NULL::numeric,
  project_manager_filter uuid DEFAULT NULL::uuid,
  created_after date DEFAULT NULL::date,
  created_before date DEFAULT NULL::date
) RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  projects_data JSON;
  total_count INTEGER;
  filtered_count INTEGER;
  projects_array JSON;
BEGIN
  -- Calculate total projects count (unfiltered, respecting show_inactive_projects)
  SELECT COUNT(*)
  INTO total_count
  FROM projects_management p
  WHERE (show_inactive_projects = true OR p.is_active = true);
  
  -- Count filtered results with comprehensive filtering
  SELECT COUNT(*)
  INTO filtered_count
  FROM projects_management p
  LEFT JOIN profiles pm_profile ON p.project_manager = pm_profile.id
  LEFT JOIN general_information pm_gi ON pm_profile.id = pm_gi.profile_id
  LEFT JOIN project_types pt ON p.project_type = pt.id
  WHERE 
    -- Active/Inactive filter
    (show_inactive_projects = true OR p.is_active = true)
    
    -- Smart search across multiple fields with weighted relevance
    AND (
      search_query IS NULL 
      OR p.project_name ILIKE '%' || search_query || '%'
      OR p.client_name ILIKE '%' || search_query || '%'
      OR p.description ILIKE '%' || search_query || '%'
      OR p.project_level ILIKE '%' || search_query || '%'
      OR pt.name ILIKE '%' || search_query || '%'
      OR COALESCE(pm_gi.first_name, pm_profile.first_name) ILIKE '%' || search_query || '%'
      OR COALESCE(pm_gi.last_name, pm_profile.last_name) ILIKE '%' || search_query || '%'
      OR pm_profile.employee_id ILIKE '%' || search_query || '%'
      OR CONCAT(
          COALESCE(pm_gi.first_name, pm_profile.first_name), ' ',
          COALESCE(pm_gi.last_name, pm_profile.last_name)
        ) ILIKE '%' || search_query || '%'
    )
    
    -- Additional filters
    AND (project_type_filter IS NULL OR p.project_type = project_type_filter)
    AND (project_level_filter IS NULL OR p.project_level ILIKE '%' || project_level_filter || '%')
    AND (budget_min IS NULL OR p.budget >= budget_min)
    AND (budget_max IS NULL OR p.budget <= budget_max)
    AND (project_manager_filter IS NULL OR p.project_manager = project_manager_filter)
    AND (created_after IS NULL OR p.created_at::date >= created_after)
    AND (created_before IS NULL OR p.created_at::date <= created_before);
  
  -- Build projects query with comprehensive data, sorting and pagination
  SELECT json_agg(
    json_build_object(
      -- Core project fields
      'id', p.id,
      'project_name', p.project_name,
      'client_name', p.client_name,
      'description', p.description,
      'project_level', p.project_level,
      'budget', p.budget,
      'is_active', p.is_active,
      'created_at', p.created_at,
      'updated_at', p.updated_at,
      
      -- Project manager information
      'project_manager', p.project_manager,
      'project_manager_profile', CASE 
        WHEN pm_profile.id IS NOT NULL THEN
          json_build_object(
            'first_name', COALESCE(pm_gi.first_name, pm_profile.first_name),
            'last_name', COALESCE(pm_gi.last_name, pm_profile.last_name),
            'employee_id', pm_profile.employee_id
          )
        ELSE NULL
      END,
      
      -- Project type information
      'project_type_data', CASE 
        WHEN pt.id IS NOT NULL THEN
          json_build_object(
            'name', pt.name
          )
        ELSE NULL
      END,
      
      -- Search relevance score (for future use in ranking)
      'relevance_score', CASE 
        WHEN search_query IS NULL THEN 0
        ELSE (
          CASE WHEN p.project_name ILIKE '%' || search_query || '%' THEN 10 ELSE 0 END +
          CASE WHEN p.client_name ILIKE '%' || search_query || '%' THEN 8 ELSE 0 END +
          CASE WHEN p.description ILIKE '%' || search_query || '%' THEN 6 ELSE 0 END +
          CASE WHEN pt.name ILIKE '%' || search_query || '%' THEN 7 ELSE 0 END +
          CASE WHEN CONCAT(
            COALESCE(pm_gi.first_name, pm_profile.first_name), ' ',
            COALESCE(pm_gi.last_name, pm_profile.last_name)
          ) ILIKE '%' || search_query || '%' THEN 5 ELSE 0 END
        )
      END
    )
    ORDER BY
      -- Relevance-based sorting when searching
      CASE WHEN search_query IS NOT NULL AND sort_by = 'relevance' THEN
        (
          CASE WHEN p.project_name ILIKE '%' || search_query || '%' THEN 10 ELSE 0 END +
          CASE WHEN p.client_name ILIKE '%' || search_query || '%' THEN 8 ELSE 0 END +
          CASE WHEN p.description ILIKE '%' || search_query || '%' THEN 6 ELSE 0 END +
          CASE WHEN pt.name ILIKE '%' || search_query || '%' THEN 7 ELSE 0 END +
          CASE WHEN CONCAT(
            COALESCE(pm_gi.first_name, pm_profile.first_name), ' ',
            COALESCE(pm_gi.last_name, pm_profile.last_name)
          ) ILIKE '%' || search_query || '%' THEN 5 ELSE 0 END
        )
      END DESC,
      
      -- Regular sorting options
      CASE WHEN sort_by = 'project_name' AND sort_order = 'asc' THEN p.project_name END ASC,
      CASE WHEN sort_by = 'project_name' AND sort_order = 'desc' THEN p.project_name END DESC,
      CASE WHEN sort_by = 'client_name' AND sort_order = 'asc' THEN p.client_name END ASC,
      CASE WHEN sort_by = 'client_name' AND sort_order = 'desc' THEN p.client_name END DESC,
      CASE WHEN sort_by = 'budget' AND sort_order = 'asc' THEN p.budget END ASC,
      CASE WHEN sort_by = 'budget' AND sort_order = 'desc' THEN p.budget END DESC,
      CASE WHEN sort_by = 'created_at' AND sort_order = 'asc' THEN p.created_at END ASC,
      CASE WHEN sort_by = 'created_at' AND sort_order = 'desc' THEN p.created_at END DESC,
      CASE WHEN sort_by = 'project_level' AND sort_order = 'asc' THEN p.project_level END ASC,
      CASE WHEN sort_by = 'project_level' AND sort_order = 'desc' THEN p.project_level END DESC,
      CASE WHEN sort_by = 'is_active' AND sort_order = 'asc' THEN p.is_active END ASC,
      CASE WHEN sort_by = 'is_active' AND sort_order = 'desc' THEN p.is_active END DESC,
      CASE WHEN sort_by = 'project_manager' AND sort_order = 'asc' THEN 
        CONCAT(COALESCE(pm_gi.first_name, pm_profile.first_name), ' ', COALESCE(pm_gi.last_name, pm_profile.last_name)) END ASC,
      CASE WHEN sort_by = 'project_manager' AND sort_order = 'desc' THEN 
        CONCAT(COALESCE(pm_gi.first_name, pm_profile.first_name), ' ', COALESCE(pm_gi.last_name, pm_profile.last_name)) END DESC,
      
      -- Default sorting
      CASE WHEN (sort_by IS NULL OR sort_by NOT IN ('project_name', 'client_name', 'budget', 'created_at', 'project_level', 'is_active', 'project_manager', 'relevance')) 
        AND (sort_order IS NULL OR sort_order = 'asc') THEN p.project_name END ASC
  )
  INTO projects_array
  FROM (
    SELECT p.*
    FROM projects_management p
    LEFT JOIN profiles pm_profile ON p.project_manager = pm_profile.id
    LEFT JOIN general_information pm_gi ON pm_profile.id = pm_gi.profile_id
    LEFT JOIN project_types pt ON p.project_type = pt.id
    WHERE 
      -- Active/Inactive filter
      (show_inactive_projects = true OR p.is_active = true)
      
      -- Smart search
      AND (
        search_query IS NULL 
        OR p.project_name ILIKE '%' || search_query || '%'
        OR p.client_name ILIKE '%' || search_query || '%'
        OR p.description ILIKE '%' || search_query || '%'
        OR p.project_level ILIKE '%' || search_query || '%'
        OR pt.name ILIKE '%' || search_query || '%'
        OR COALESCE(pm_gi.first_name, pm_profile.first_name) ILIKE '%' || search_query || '%'
        OR COALESCE(pm_gi.last_name, pm_profile.last_name) ILIKE '%' || search_query || '%'
        OR pm_profile.employee_id ILIKE '%' || search_query || '%'
        OR CONCAT(
            COALESCE(pm_gi.first_name, pm_profile.first_name), ' ',
            COALESCE(pm_gi.last_name, pm_profile.last_name)
          ) ILIKE '%' || search_query || '%'
      )
      
      -- Additional filters
      AND (project_type_filter IS NULL OR p.project_type = project_type_filter)
      AND (project_level_filter IS NULL OR p.project_level ILIKE '%' || project_level_filter || '%')
      AND (budget_min IS NULL OR p.budget >= budget_min)
      AND (budget_max IS NULL OR p.budget <= budget_max)
      AND (project_manager_filter IS NULL OR p.project_manager = project_manager_filter)
      AND (created_after IS NULL OR p.created_at::date >= created_after)
      AND (created_before IS NULL OR p.created_at::date <= created_before)
    
    ORDER BY
      -- Relevance-based sorting when searching
      CASE WHEN search_query IS NOT NULL AND sort_by = 'relevance' THEN
        (
          CASE WHEN p.project_name ILIKE '%' || search_query || '%' THEN 10 ELSE 0 END +
          CASE WHEN p.client_name ILIKE '%' || search_query || '%' THEN 8 ELSE 0 END +
          CASE WHEN p.description ILIKE '%' || search_query || '%' THEN 6 ELSE 0 END +
          CASE WHEN pt.name ILIKE '%' || search_query || '%' THEN 7 ELSE 0 END +
          CASE WHEN CONCAT(
            COALESCE(pm_gi.first_name, pm_profile.first_name), ' ',
            COALESCE(pm_gi.last_name, pm_profile.last_name)
          ) ILIKE '%' || search_query || '%' THEN 5 ELSE 0 END
        )
      END DESC,
      
      -- Regular sorting options
      CASE WHEN sort_by = 'project_name' AND sort_order = 'asc' THEN p.project_name END ASC,
      CASE WHEN sort_by = 'project_name' AND sort_order = 'desc' THEN p.project_name END DESC,
      CASE WHEN sort_by = 'client_name' AND sort_order = 'asc' THEN p.client_name END ASC,
      CASE WHEN sort_by = 'client_name' AND sort_order = 'desc' THEN p.client_name END DESC,
      CASE WHEN sort_by = 'budget' AND sort_order = 'asc' THEN p.budget END ASC,
      CASE WHEN sort_by = 'budget' AND sort_order = 'desc' THEN p.budget END DESC,
      CASE WHEN sort_by = 'created_at' AND sort_order = 'asc' THEN p.created_at END ASC,
      CASE WHEN sort_by = 'created_at' AND sort_order = 'desc' THEN p.created_at END DESC,
      CASE WHEN sort_by = 'project_level' AND sort_order = 'asc' THEN p.project_level END ASC,
      CASE WHEN sort_by = 'project_level' AND sort_order = 'desc' THEN p.project_level END DESC,
      CASE WHEN sort_by = 'is_active' AND sort_order = 'asc' THEN p.is_active END ASC,
      CASE WHEN sort_by = 'is_active' AND sort_order = 'desc' THEN p.is_active END DESC,
      CASE WHEN sort_by = 'project_manager' AND sort_order = 'asc' THEN 
        CONCAT(COALESCE(pm_gi.first_name, pm_profile.first_name), ' ', COALESCE(pm_gi.last_name, pm_profile.last_name)) END ASC,
      CASE WHEN sort_by = 'project_manager' AND sort_order = 'desc' THEN 
        CONCAT(COALESCE(pm_gi.first_name, pm_profile.first_name), ' ', COALESCE(pm_gi.last_name, pm_profile.last_name)) END DESC,
      
      -- Default sorting
      CASE WHEN (sort_by IS NULL OR sort_by NOT IN ('project_name', 'client_name', 'budget', 'created_at', 'project_level', 'is_active', 'project_manager', 'relevance')) 
        AND (sort_order IS NULL OR sort_order = 'asc') THEN p.project_name END ASC
    
    LIMIT items_per_page
    OFFSET (page_number - 1) * items_per_page
  ) p
  LEFT JOIN profiles pm_profile ON p.project_manager = pm_profile.id
  LEFT JOIN general_information pm_gi ON pm_profile.id = pm_gi.profile_id
  LEFT JOIN project_types pt ON p.project_type = pt.id;
  
  -- Build final result JSON
  SELECT json_build_object(
    'projects', COALESCE(projects_array, '[]'::json),
    'pagination', json_build_object(
      'total_count', total_count,
      'filtered_count', filtered_count,
      'page', page_number,
      'per_page', items_per_page,
      'page_count', CEIL(filtered_count::numeric / items_per_page)
    )
  ) INTO projects_data;
  
  RETURN projects_data;
END;
$function$;

-- Create a helper function for bulk sync of Odoo projects
CREATE OR REPLACE FUNCTION public.bulk_sync_odoo_projects(projects_data jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  project_record jsonb;
  project_manager_id uuid;
  project_type_id uuid;
  inserted_count integer := 0;
  updated_count integer := 0;
  skipped_count integer := 0;
  error_projects jsonb := '[]'::jsonb;
  result_stats jsonb;
BEGIN
  -- Process each project in the input array
  FOR project_record IN SELECT * FROM jsonb_array_elements(projects_data)
  LOOP
    BEGIN
      -- Look up project manager by email if provided
      project_manager_id := NULL;
      IF (project_record->>'managerEmail') IS NOT NULL AND (project_record->>'managerEmail') != '' THEN
        SELECT id INTO project_manager_id 
        FROM profiles 
        WHERE email = (project_record->>'managerEmail')
        LIMIT 1;
        
        -- Log the lookup result
        IF project_manager_id IS NOT NULL THEN
          RAISE LOG 'Project manager lookup for email %: Found', (project_record->>'managerEmail');
        ELSE
          RAISE LOG 'Project manager lookup for email %: Not found', (project_record->>'managerEmail');
        END IF;
      END IF;

      -- Look up project type by name if provided
      project_type_id := NULL;
      IF (project_record->>'projectType') IS NOT NULL AND (project_record->>'projectType') != '' THEN
        SELECT id INTO project_type_id 
        FROM project_types 
        WHERE name = (project_record->>'projectType')
        LIMIT 1;
        
        -- Log the lookup result
        IF project_type_id IS NOT NULL THEN
          RAISE LOG 'Project type lookup for %: Found', (project_record->>'projectType');
        ELSE
          RAISE LOG 'Project type lookup for %: Not found', (project_record->>'projectType');
        END IF;
      END IF;

      -- Log processing
      RAISE LOG 'Processing project: %', (project_record->>'projectName');

      -- Attempt to insert or update the project
      INSERT INTO projects_management (
        project_name,
        client_name,
        description,
        project_level,
        project_manager,
        project_type,
        budget,
        is_active
      ) VALUES (
        project_record->>'projectName',
        NULLIF(project_record->>'clientName', ''),
        NULLIF(project_record->>'description', ''),
        NULLIF(project_record->>'projectLevel', ''),
        project_manager_id,
        project_type_id,
        CASE 
          WHEN (project_record->>'projectValue') IS NOT NULL 
            AND (project_record->>'projectValue') != '' 
          THEN (project_record->>'projectValue')::numeric 
          ELSE NULL 
        END,
        COALESCE((project_record->>'active')::boolean, true)
      )
      ON CONFLICT (project_name) 
      DO UPDATE SET
        client_name = EXCLUDED.client_name,
        description = EXCLUDED.description,
        project_level = EXCLUDED.project_level,
        project_manager = EXCLUDED.project_manager,
        project_type = EXCLUDED.project_type,
        budget = EXCLUDED.budget,
        is_active = EXCLUDED.is_active,
        updated_at = now();

      -- Check if it was an insert or update
      IF FOUND THEN
        -- Check if the project existed before this operation
        IF EXISTS (
          SELECT 1 FROM projects_management 
          WHERE project_name = (project_record->>'projectName')
          AND updated_at < created_at + interval '1 second'
        ) THEN
          inserted_count := inserted_count + 1;
          RAISE LOG 'Inserted new project: %', (project_record->>'projectName');
        ELSE
          updated_count := updated_count + 1;
          RAISE LOG 'Updated project: %', (project_record->>'projectName');
        END IF;
      ELSE
        skipped_count := skipped_count + 1;
        RAISE LOG 'Skipped project: %', (project_record->>'projectName');
      END IF;

    EXCEPTION
      WHEN OTHERS THEN
        -- Log the error and add to error list
        RAISE LOG 'Error processing project %: %', (project_record->>'projectName'), SQLERRM;
        error_projects := error_projects || jsonb_build_object(
          'projectName', project_record->>'projectName',
          'error', SQLERRM
        );
        skipped_count := skipped_count + 1;
    END;
  END LOOP;

  -- Log completion
  RAISE LOG 'Bulk sync completed - Inserted: %, Updated: %, Skipped: %', inserted_count, updated_count, skipped_count;

  -- Build result statistics
  result_stats := jsonb_build_object(
    'stats', jsonb_build_object(
      'total_processed', inserted_count + updated_count + skipped_count,
      'inserted', inserted_count,
      'updated', updated_count,
      'skipped', skipped_count
    ),
    'error_projects', error_projects
  );

  RETURN result_stats;
END;
$function$;
