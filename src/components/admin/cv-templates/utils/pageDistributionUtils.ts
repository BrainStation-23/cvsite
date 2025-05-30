
import { SectionSplitter } from '@/utils/sectionSplitter';

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

export interface PageContent {
  pageNumber: number;
  sections: TemplateSection[];
  partialSections: {
    [sectionId: string]: {
      items: any[];
      startIndex: number;
      totalItems: number;
      isPartial: boolean;
      title: string;
    };
  };
}

export function getSectionData(profile: any, sectionType: string): any {
  switch (sectionType) {
    case 'general':
      return profile;
    case 'experience':
      return profile.experiences || [];
    case 'education':
      return profile.education || [];
    case 'projects':
      return profile.projects || [];
    case 'technical_skills':
      return profile.technical_skills || [];
    case 'specialized_skills':
      return profile.specialized_skills || [];
    case 'training':
      return profile.trainings || [];
    case 'achievements':
      return profile.achievements || [];
    default:
      return null;
  }
}

export function getSectionTitle(section: TemplateSection, fieldMappings: FieldMapping[]): string {
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

export function canSectionBeSplit(sectionType: string): boolean {
  return ['experience', 'projects', 'education', 'training', 'achievements'].includes(sectionType);
}

export function splitSectionData(
  sectionType: string,
  remainingItems: any[],
  availableHeight: number,
  sectionTitle: string
) {
  switch (sectionType) {
    case 'experience':
      return SectionSplitter.splitExperienceSection(remainingItems, availableHeight, sectionTitle);
    case 'projects':
      return SectionSplitter.splitProjectsSection(remainingItems, availableHeight, sectionTitle);
    case 'education':
      return SectionSplitter.splitEducationSection(remainingItems, availableHeight, sectionTitle);
    case 'achievements':
      return SectionSplitter.splitAchievementsSection(remainingItems, availableHeight, sectionTitle);
    default:
      return { pageItems: remainingItems, remainingItems: [], sectionTitle };
  }
}
