
-- Add section table mapping for references
INSERT INTO cv_section_table_mappings (section_type, table_name, display_name, description)
VALUES ('references', 'references', 'References', 'Professional references and contacts');

-- Add field display config entries for references section with correct field types
INSERT INTO cv_field_display_config (
  field_name, 
  section_type, 
  display_label, 
  default_enabled, 
  default_masked, 
  default_order, 
  field_type, 
  is_system_field
) VALUES 
  ('name', 'references', 'Name', true, false, 1, 'text', false),
  ('designation', 'references', 'Designation', true, false, 2, 'text', false),
  ('company', 'references', 'Company', true, false, 3, 'text', false),
  ('email', 'references', 'Email', true, false, 4, 'text', false),
  ('phone', 'references', 'Phone', false, false, 5, 'text', false);
