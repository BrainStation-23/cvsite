
interface FieldMapping {
  original_field_name: string;
  display_name: string;
  is_masked: boolean;
  mask_value?: string;
  field_order: number;
  visibility_rules: Record<string, any>;
  section_type: string;
}

interface TemplateSection {
  id: string;
  section_type: string;
  display_order: number;
  is_required: boolean;
  field_mapping: Record<string, any>;
  styling_config: Record<string, any>;
}

export class ExperienceSectionRenderer {
  // Helper function to format date in MMM'YYYY format (e.g., Jan'2021)
  private formatDate(dateString: string | null | undefined): string {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      const month = date.toLocaleDateString('en-US', { month: 'short' });
      const year = date.getFullYear();
      return `${month}'${year}`;
    } catch {
      return dateString.toString();
    }
  }

  // Helper function to check if a field is enabled based on field mappings
  private isFieldEnabled(fieldName: string, fieldMappings: FieldMapping[]): boolean {
    const mapping = fieldMappings.find(m => m.original_field_name === fieldName);
    return mapping ? mapping.visibility_rules?.enabled !== false : true;
  }

  // Helper function to apply masking
  private applyMasking(value: any, fieldName: string, fieldMappings: FieldMapping[]): any {
    const mapping = fieldMappings.find(m => m.original_field_name === fieldName);
    if (!mapping?.is_masked || !value) return value;

    if (mapping.mask_value) {
      return mapping.mask_value;
    } else {
      // Default masking
      if (typeof value === 'string' && value.length > 3) {
        return value.substring(0, 3) + '***';
      }
      return '***';
    }
  }

  // Helper function to get ordered fields
  private getOrderedFields(fieldMappings: FieldMapping[]): FieldMapping[] {
    const experienceFields = fieldMappings.filter(m => m.section_type === 'experience');
    return experienceFields.sort((a, b) => a.field_order - b.field_order);
  }

  render(profile: any, fieldMappings: FieldMapping[], section: TemplateSection, customTitle?: string): string {
    const title = customTitle || 'Professional Experience';
    const experiences = profile.experiences || [];

    const experienceItems = experiences.map((exp: any) => {
      const startDate = this.formatDate(exp.start_date);
      const endDate = exp.end_date ? this.formatDate(exp.end_date) : 'Present';
      const dateRange = `${startDate} - ${endDate}`;

      // Get ordered fields
      const orderedFields = this.getOrderedFields(fieldMappings);

      // Create HTML for each field based on order
      let fieldsHTML = '';

      // Always show job title at the top
      fieldsHTML += `<h2 class="item-title">${exp.job_title || ''}</h2>`;

      // Create subtitle div with ordered fields
      let subtitleHTML = '';

      // Process each field in order
      const visibleFields = orderedFields
        .filter(field => this.isFieldEnabled(field.original_field_name, fieldMappings))
        .map((field, index) => {
          const fieldName = field.original_field_name;
          let fieldValue = '';

          switch(fieldName) {
            case 'company_name':
              fieldValue = this.applyMasking(exp.company_name, fieldName, fieldMappings);
              break;
            case 'designation':
              fieldValue = this.applyMasking(exp.designation, fieldName, fieldMappings);
              break;
            case 'date_range':
              fieldValue = this.applyMasking(dateRange, fieldName, fieldMappings);
              break;
          }

          if (!fieldValue) return '';

          // Apply different styling based on field position
          if (index === 0) {
            // First item as heading
            return `<div class="field-heading">${fieldValue}</div>`;
          } else {
            // Second and third items as sub-heading
            return `<div class="field-subheading">${fieldValue}</div>`;
          }
        })
        .filter(html => html.length > 0);

      // Add each field on a new line
      subtitleHTML = visibleFields.join('');

      // Add subtitle if any fields were added
      if (subtitleHTML) {
        fieldsHTML += `<div class="item-subtitle">${subtitleHTML}</div>`;
      }

      // Add description if enabled
      if (this.isFieldEnabled('description', fieldMappings) && exp.description) {
        const maskedDescription = this.applyMasking(exp.description, 'description', fieldMappings);
        fieldsHTML += `<div class="item-description">${maskedDescription}</div>`;
      }

      return `
      <div class="item experience-item">
        <div class="item-header">
          ${fieldsHTML}
        </div>
      </div>
    `;
    }).join('');

    return `<div class="section experience-section">
      <h2 class="section-title">${title}</h2>
      <div class="section-content">
        ${experienceItems}
      </div>
    </div>`;
  }
}
