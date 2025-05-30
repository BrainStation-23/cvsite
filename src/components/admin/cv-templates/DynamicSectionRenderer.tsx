
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

    // Only render sections that are explicitly configured
    // Each section component should handle its own field configuration and visibility
    switch (section.section_type) {
      case 'general':
        return <GeneralInfoSection key={section.id} {...commonProps} />;
      case 'experience':
        return <ExperienceSection key={section.id} {...commonProps} />;
      case 'education':
        return <EducationSection key={section.id} {...commonProps} />;
      case 'skills':
      case 'technical_skills':
      case 'specialized_skills':
        return <SkillsSection key={section.id} {...commonProps} />;
      case 'projects':
        return <ProjectsSection key={section.id} {...commonProps} />;
      case 'training':
        return <TrainingsSection key={section.id} {...commonProps} />;
      case 'achievements':
        return <AchievementsSection key={section.id} {...commonProps} />;
      default:
        console.warn(`Unknown section type: ${section.section_type}`);
        return (
          <div key={section.id} style={{ 
            padding: '8px', 
            backgroundColor: '#f9f9f9', 
            border: '1px dashed #ccc',
            margin: '8px 0',
            fontSize: '12px',
            color: '#666',
            textAlign: 'center'
          }}>
            Unknown section type: {section.section_type}
          </div>
        );
    }
  };

  // If no sections are provided, return nothing
  if (!sections || sections.length === 0) {
    return null;
  }

  // Sort sections by display_order and render
  const sortedSections = [...sections].sort((a, b) => a.display_order - b.display_order);
  
  return (
    <>
      {sortedSections.map(section => renderSection(section))}
    </>
  );
};
