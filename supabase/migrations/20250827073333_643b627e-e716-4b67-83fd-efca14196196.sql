
-- Create enum for PIP status states
CREATE TYPE pip_status_enum AS ENUM (
  'hr_initiation',
  'pm_feedback', 
  'hr_review',
  'ld_goal_setting',
  'mid_review',
  'final_review'
);

-- Update the performance_improvement_plans table to use the new enum
ALTER TABLE performance_improvement_plans 
ALTER COLUMN status TYPE pip_status_enum 
USING status::pip_status_enum;

-- Set default value for new records
ALTER TABLE performance_improvement_plans 
ALTER COLUMN status SET DEFAULT 'hr_initiation';

-- Update existing records that might have old status values
UPDATE performance_improvement_plans 
SET status = 'hr_initiation' 
WHERE status NOT IN ('hr_initiation', 'pm_feedback', 'hr_review', 'ld_goal_setting', 'mid_review', 'final_review');
