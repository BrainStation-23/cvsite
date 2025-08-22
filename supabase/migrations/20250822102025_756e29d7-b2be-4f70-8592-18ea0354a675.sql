
-- Add new columns to cv_templates table for dynamic configuration
ALTER TABLE cv_templates 
ADD COLUMN data_source_function TEXT NOT NULL DEFAULT 'get_employee_data_masked',
ADD COLUMN orientation TEXT NOT NULL DEFAULT 'portrait';

-- Add check constraint for orientation values
ALTER TABLE cv_templates 
ADD CONSTRAINT cv_templates_orientation_check 
CHECK (orientation IN ('portrait', 'landscape'));

-- Update existing templates to have explicit values (they already have defaults but let's be explicit)
UPDATE cv_templates 
SET data_source_function = 'get_employee_data_masked', 
    orientation = 'portrait' 
WHERE data_source_function IS NULL OR orientation IS NULL;
