
export class FieldMaskingService {
  private fieldMappings: any[] = [];

  setFieldMappings(fieldMappings: any[]): void {
    this.fieldMappings = fieldMappings;
  }

  applyMasking(value: any, fieldName: string, sectionType: string): any {
    if (!value || !this.fieldMappings) return value;
    
    const fieldMapping = this.fieldMappings.find(
      mapping => mapping.original_field_name === fieldName && mapping.section_type === sectionType
    );
    
    if (!fieldMapping || !fieldMapping.is_masked) return value;
    
    // Apply masking
    if (fieldMapping.mask_value) {
      return fieldMapping.mask_value;
    } else {
      // Default masking
      if (typeof value === 'string' && value.length > 3) {
        return value.substring(0, 3) + '***';
      }
      return '***';
    }
  }

  getSectionTitle(section: any): string {
    const titleMapping = this.fieldMappings.find(
      mapping => mapping.original_field_name === 'section_title' && mapping.section_type === section.section_type
    );
    
    const defaultTitles = {
      general: 'General Information',
      experience: 'Work Experience',
      education: 'Education',
      projects: 'Projects',
      technical_skills: 'Technical Skills',
      specialized_skills: 'Specialized Skills',
      training: 'Training & Certifications',
      achievements: 'Achievements'
    };

    return titleMapping?.display_name || defaultTitles[section.section_type as keyof typeof defaultTitles] || section.section_type;
  }
}
