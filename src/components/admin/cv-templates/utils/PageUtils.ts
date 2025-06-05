
import { TemplateSection, FieldMapping } from '../layout-strategies/LayoutStrategyInterface';

export class PageUtils {
  static getSectionTitle(section: TemplateSection, fieldMappings: FieldMapping[]): string {
    const titleMapping = fieldMappings.find(
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

  static canSectionBeSplit(sectionType: string): boolean {
    return ['experience', 'projects', 'education', 'training', 'achievements'].includes(sectionType);
  }
}
