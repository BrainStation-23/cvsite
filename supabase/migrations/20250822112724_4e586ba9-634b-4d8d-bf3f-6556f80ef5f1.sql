
-- Add missing description column to projects_management table
ALTER TABLE projects_management 
ADD COLUMN description text;

-- Add index for better performance on project_manager lookups
CREATE INDEX IF NOT EXISTS idx_projects_management_project_manager 
ON projects_management(project_manager);

-- Add index for better performance on project_level filtering
CREATE INDEX IF NOT EXISTS idx_projects_management_project_level 
ON projects_management(project_level);
