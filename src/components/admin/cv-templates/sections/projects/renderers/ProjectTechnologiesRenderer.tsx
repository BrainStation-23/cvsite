import { FieldProcessor } from '../../../FieldProcessor';

interface FieldMapping {
  original_field_name: string;
  display_name: string;
  is_masked: boolean;
  mask_value?: string;
  field_order: number;
  visibility_rules: Record<string, any>;
  section_type: string;
}

export const ProjectTechnologiesRenderer = (
  project: any, 
  fieldMappings: FieldMapping[], 
  styles: any, 
  applyMasking: (value: any, fieldName: string) => any
) => {
  // Apply masking to each technology individually
  const maskedTechnologies = project.technologies_used?.map((tech: string) => 
    applyMasking(tech, 'technologies_used')
  );
  
  return (
    <FieldProcessor
      key="technologies_used"
      fieldName="technologies_used"
      value={maskedTechnologies}
      fieldMappings={fieldMappings}
      sectionType="projects"
    >
      {(processedValue, _displayName, shouldShow) => (
        shouldShow && processedValue && processedValue.length > 0 && (
          <div style={{ marginTop: '5pt' }}>
            <div style={styles.skillsContainerStyles}>
              {processedValue.map((tech: string, techIndex: number) => (
                <span key={techIndex} style={styles.skillStyles}>
                  {tech}
                </span>
              ))}
            </div>
          </div>
        )
      )}
    </FieldProcessor>
  );
};
