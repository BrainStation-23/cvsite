
import React from 'react';
import { GeneralInfoSection } from './sections/GeneralInfoSection';
import { ExperienceSection } from './sections/ExperienceSection';
import { EducationSection } from './sections/EducationSection';
import { SkillsSection } from './sections/SkillsSection';
import { ProjectsSection } from './sections/ProjectsSection';
import { TrainingsSection } from './sections/TrainingsSection';
import { AchievementsSection } from './sections/AchievementsSection';

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

interface DynamicSectionRendererProps {
  sections: TemplateSection[];
  fieldMappings: FieldMapping[];
  profile: any;
  styles: any;
}

export const DynamicSectionRenderer: React.FC<DynamicSectionRendererProps> = ({
  sections,
  fieldMappings,
  profile,
  styles
}) => {
  const renderSection = (section: TemplateSection) => {
    // Apply custom styling from section configuration
    const sectionStyles = {
      ...styles,
      // Merge in custom styling_config if present
      ...(section.styling_config || {})
    };

    // Get field mappings for this section
    const sectionFieldMappings = fieldMappings.filter(
      mapping => mapping.section_type === section.section_type
    );

    const commonProps = {
      profile,
      styles: sectionStyles,
      fieldMappings: sectionFieldMappings,
      sectionConfig: section
    };

    switch (section.section_type) {
      case 'general':
        return <GeneralInfoSection key={section.id} {...commonProps} />;
      case 'experience':
        // Always render experience section if configured, regardless of data
        // The section component will handle empty data display
        return <ExperienceSection key={section.id} {...commonProps} />;
      case 'education':
        if (section.is_required || (profile.education && profile.education.length > 0)) {
          return <EducationSection key={section.id} {...commonProps} />;
        }
        break;
      case 'skills':
      case 'technical_skills':
      case 'specialized_skills':
        if (section.is_required || 
           (profile.technical_skills && profile.technical_skills.length > 0) ||
           (profile.specialized_skills && profile.specialized_skills.length > 0)) {
          return <SkillsSection key={section.id} {...commonProps} />;
        }
        break;
      case 'projects':
        // Always render projects section if configured, regardless of data
        // The section component will handle empty data display
        return <ProjectsSection key={section.id} {...commonProps} />;
      case 'training':
        if (section.is_required || (profile.trainings && profile.trainings.length > 0)) {
          return <TrainingsSection key={section.id} {...commonProps} />;
        }
        break;
      case 'achievements':
        if (section.is_required || (profile.achievements && profile.achievements.length > 0)) {
          return <AchievementsSection key={section.id} {...commonProps} />;
        }
        break;
      default:
        console.warn(`Unknown section type: ${section.section_type}`);
        break;
    }
    return null;
  };

  // Sort sections by display_order and render
  const sortedSections = [...sections].sort((a, b) => a.display_order - b.display_order);
  
  return (
    <>
      {sortedSections.map(section => renderSection(section))}
    </>
  );
};
