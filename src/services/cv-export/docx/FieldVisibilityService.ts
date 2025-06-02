
export class FieldVisibilityService {
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

  isFieldVisible(fieldName: string, sectionType: string): boolean {
    // Check section-level field configuration
    const sectionConfig = this.sectionConfigs.get(sectionType);
    if (sectionConfig?.styling_config?.fields) {
      const fieldConfig = sectionConfig.styling_config.fields.find(
        (f: any) => f.field === fieldName
      );
      if (fieldConfig !== undefined) {
        return fieldConfig.enabled;
      }
    }

    // Check field mappings for visibility rules
    const fieldMapping = this.fieldMappings.find(
      mapping => mapping.original_field_name === fieldName && mapping.section_type === sectionType
    );

    if (fieldMapping?.visibility_rules) {
      // Apply visibility rules logic here
      return fieldMapping.visibility_rules.visible !== false;
    }

    // Default to visible if no configuration found
    return true;
  }

  getFieldOrder(fieldName: string, sectionType: string): number {
    // Check section-level field order
    const sectionConfig = this.sectionConfigs.get(sectionType);
    if (sectionConfig?.styling_config?.fields) {
      const fieldConfig = sectionConfig.styling_config.fields.find(
        (f: any) => f.field === fieldName
      );
      if (fieldConfig) {
        return fieldConfig.order || 0;
      }
    }

    // Check field mappings for order
    const fieldMapping = this.fieldMappings.find(
      mapping => mapping.original_field_name === fieldName && mapping.section_type === sectionType
    );

    return fieldMapping?.field_order || 0;
  }

  getVisibleFields(sectionType: string, defaultFields: string[]): string[] {
    const visibleFields = defaultFields.filter(field => 
      this.isFieldVisible(field, sectionType)
    );

    // Sort by order
    return visibleFields.sort((a, b) => 
      this.getFieldOrder(a, sectionType) - this.getFieldOrder(b, sectionType)
    );
  }
}
