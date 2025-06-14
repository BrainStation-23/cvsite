
-- Update the check constraint to include 'references' as a valid section type
ALTER TABLE cv_template_sections 
DROP CONSTRAINT check_section_type;

ALTER TABLE cv_template_sections 
ADD CONSTRAINT check_section_type 
CHECK (section_type = ANY (ARRAY[
  'general'::text, 
  'technical_skills'::text, 
  'specialized_skills'::text, 
  'experience'::text, 
  'education'::text, 
  'training'::text, 
  'achievements'::text, 
  'projects'::text, 
  'page_break'::text,
  'references'::text
]));
