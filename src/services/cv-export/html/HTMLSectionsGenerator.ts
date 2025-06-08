
import { HTMLFieldProcessor } from './HTMLFieldProcessor';
import { GeneralSectionRenderer } from './sections/GeneralSectionRenderer';
import { ExperienceSectionRenderer } from './sections/ExperienceSectionRenderer';
import { EducationSectionRenderer } from './sections/EducationSectionRenderer';
import { SkillsSectionRenderer } from './sections/SkillsSectionRenderer';
import { ProjectsSectionRenderer } from './sections/ProjectsSectionRenderer';
import { TrainingSectionRenderer } from './sections/TrainingSectionRenderer';
import { AchievementsSectionRenderer } from './sections/AchievementsSectionRenderer';

interface TemplateSection {
  id: string;
  section_type: string;
  display_order: number;
  is_required: boolean;
  field_mapping: Record<string, any>;
  styling_config: Record<string, any>;
}

interface FieldMapping {
  original_field_name: string;
  display_name: string;
  is_masked: boolean;
  mask_value?: string;
  field_order: number;
  visibility_rules: Record<string, any>;
  section_type: string;
}

export class HTMLSectionsGenerator {
  private fieldProcessor = new HTMLFieldProcessor();
  private generalRenderer = new GeneralSectionRenderer(this.fieldProcessor);
  private experienceRenderer = new ExperienceSectionRenderer();
  private educationRenderer = new EducationSectionRenderer();
  private skillsRenderer = new SkillsSectionRenderer();
  private projectsRenderer = new ProjectsSectionRenderer();
  private trainingRenderer = new TrainingSectionRenderer();
  private achievementsRenderer = new AchievementsSectionRenderer();

  generateSectionsHTML(
    sections: TemplateSection[], 
    profile: any, 
    fieldMappings: FieldMapping[],
    partialSections: any = {}
  ): string {
    if (!sections || sections.length === 0) {
      return '';
    }

    // Sort sections by display order
    const sortedSections = [...sections].sort((a, b) => a.display_order - b.display_order);
    
    return sortedSections.map(section => this.renderSection(section, profile, fieldMappings, partialSections)).join('\n');
  }

  private renderSection(
    section: TemplateSection, 
    profile: any, 
    fieldMappings: FieldMapping[],
    partialSections: any
  ): string {
    // Handle page break sections
    if (section.section_type === 'page_break') {
      return '<div class="page-break"></div>';
    }

    // Get field mappings for this section
    const sectionFieldMappings = fieldMappings.filter(
      mapping => mapping.section_type === section.section_type
    );

    // Check if this section has partial data for this page
    const partialData = partialSections[section.id];
    
    // Create modified profile with partial data if applicable
    const profileForSection = partialData ? {
      ...profile,
      [this.getSectionDataKey(section.section_type)]: partialData.items
    } : profile;

    // Generate section HTML based on type
    switch (section.section_type) {
      case 'general':
        return this.generalRenderer.render(profileForSection, sectionFieldMappings, section, partialData?.title);
      case 'experience':
        return this.experienceRenderer.render(profileForSection, sectionFieldMappings, section, partialData?.title);
      case 'education':
        return this.educationRenderer.render(profileForSection, sectionFieldMappings, section, partialData?.title);
      case 'technical_skills':
        return this.skillsRenderer.renderTechnicalSkills(profileForSection, sectionFieldMappings, section, partialData?.title);
      case 'specialized_skills':
        return this.skillsRenderer.renderSpecializedSkills(profileForSection, sectionFieldMappings, section, partialData?.title);
      case 'projects':
        return this.projectsRenderer.render(profileForSection, sectionFieldMappings, section, partialData?.title);
      case 'training':
        return this.trainingRenderer.render(profileForSection, sectionFieldMappings, section, partialData?.title);
      case 'achievements':
        return this.achievementsRenderer.render(profileForSection, sectionFieldMappings, section, partialData?.title);
      default:
        console.warn(`Unknown section type: ${section.section_type}`);
        return `<div class="unknown-section">Unknown section type: ${section.section_type}</div>`;
    }
  }

  private getSectionDataKey(sectionType: string): string {
    switch (sectionType) {
      case 'experience':
        return 'experiences';
      case 'education':
        return 'education';
      case 'projects':
        return 'projects';
      case 'technical_skills':
        return 'technical_skills';
      case 'specialized_skills':
        return 'specialized_skills';
      case 'training':
        return 'trainings';
      case 'achievements':
        return 'achievements';
      default:
        return sectionType;
    }
  }
}
