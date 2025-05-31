
export class FieldMaskingService {
  private fieldMappings: any[] = [];
  private sectionConfigs: Map<string, any> = new Map();

  setFieldMappings(fieldMappings: any[]): void {
    this.fieldMappings = fieldMappings;
  }

  setSectionConfigs(sections: any[]): void {
    this.sectionConfigs.clear();
    sections.forEach(section => {
      this.sectionConfigs.set(section.section_type, section);
    });
  }

  applyMasking(value: any, fieldName: string, sectionType: string): any {
    if (!value || value === null || value === undefined) return value;
    
    console.log(`Applying masking for field: ${fieldName}, section: ${sectionType}, value:`, value);
    
    // Check section-level field configuration first
    const sectionConfig = this.sectionConfigs.get(sectionType);
    if (sectionConfig?.styling_config?.fields) {
      const fieldConfig = sectionConfig.styling_config.fields.find(
        (f: any) => f.field === fieldName
      );
      if (fieldConfig && fieldConfig.masked) {
        console.log(`Field ${fieldName} is masked via section config`);
        if (fieldConfig.mask_value) {
          return fieldConfig.mask_value;
        } else {
          return this.getDefaultMask(value);
        }
      }
    }

    // Check field mappings for masking
    const fieldMapping = this.fieldMappings.find(
      mapping => mapping.original_field_name === fieldName && mapping.section_type === sectionType
    );
    
    if (fieldMapping && fieldMapping.is_masked) {
      console.log(`Field ${fieldName} is masked via field mapping`);
      if (fieldMapping.mask_value) {
        return fieldMapping.mask_value;
      } else {
        return this.getDefaultMask(value);
      }
    }
    
    return value;
  }

  private getDefaultMask(value: any): string {
    if (typeof value === 'string' && value.length > 3) {
      return value.substring(0, 3) + '***';
    }
    return '***';
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
