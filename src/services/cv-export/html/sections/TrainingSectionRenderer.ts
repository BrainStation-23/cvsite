
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

export class TrainingSectionRenderer {
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

  render(profile: any, fieldMappings: FieldMapping[], section: TemplateSection, customTitle?: string): string {
    const title = customTitle || 'Training & Certifications';
    const trainings = profile.trainings || [];

    const trainingItems = trainings.map((training: any) => {
      const completionDate = this.formatDate(training.completion_date);

      return `
      <div class="item training-item">
        <div class="item-header">
          <h4 class="item-title">${training.name || ''}</h4>
          <div class="item-subtitle">
            <div class="field-heading">${training.provider || ''}</div>
            <div class="field-subheading">${completionDate}</div>
          </div>
        </div>
        ${training.description ? `<div class="item-description">${training.description}</div>` : ''}
      </div>
    `;
    }).join('');

    return `<div class="section training-section">
      <h2 class="section-title">${title}</h2>
      <div class="section-content">
        ${trainingItems}
      </div>
    </div>`;
  }
}
