
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

export class AchievementsSectionRenderer {
  render(profile: any, fieldMappings: FieldMapping[], section: TemplateSection, customTitle?: string): string {
    const title = customTitle || 'Achievements';
    const achievements = profile.achievements || [];
    
    const achievementItems = achievements.map((achievement: any) => `
      <div class="item achievement-item">
        <div class="item-header">
          <h4 class="item-title">${achievement.title || ''}</h4>
          <div class="item-subtitle">${achievement.date || ''}</div>
        </div>
        ${achievement.description ? `<div class="item-description">${achievement.description}</div>` : ''}
      </div>
    `).join('');

    return `<div class="section achievements-section">
      <h2 class="section-title">${title}</h2>
      <div class="section-content">
        ${achievementItems}
      </div>
    </div>`;
  }
}
