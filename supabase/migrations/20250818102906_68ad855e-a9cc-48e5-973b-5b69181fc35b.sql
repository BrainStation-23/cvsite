
-- Add enabled and default fields to cv_templates table
ALTER TABLE cv_templates 
ADD COLUMN enabled boolean NOT NULL DEFAULT true,
ADD COLUMN is_default boolean NOT NULL DEFAULT false;

-- Ensure only one template can be default at a time
CREATE UNIQUE INDEX CONCURRENTLY idx_cv_templates_single_default 
ON cv_templates (is_default) 
WHERE is_default = true;

-- Create a trigger to ensure only one default template
CREATE OR REPLACE FUNCTION ensure_single_default_cv_template()
RETURNS TRIGGER AS $$
BEGIN
  -- If setting this template as default, unset all others
  IF NEW.is_default = true THEN
    UPDATE cv_templates 
    SET is_default = false 
    WHERE id != NEW.id AND is_default = true;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_ensure_single_default_cv_template
  BEFORE INSERT OR UPDATE ON cv_templates
  FOR EACH ROW
  WHEN (NEW.is_default = true)
  EXECUTE FUNCTION ensure_single_default_cv_template();
