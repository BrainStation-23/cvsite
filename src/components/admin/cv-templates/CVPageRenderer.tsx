import React from 'react';
import { DynamicSectionRenderer } from './DynamicSectionRenderer';

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

interface CVPageRendererProps {
  pageNumber: number;
  totalPages: number;
  profile: any;
  styles: any;
  sections?: TemplateSection[];
  fieldMappings?: FieldMapping[];
}

export const CVPageRenderer: React.FC<CVPageRendererProps> = ({ 
  pageNumber, 
  totalPages, 
  profile, 
  styles,
  sections = [],
  fieldMappings = []
}) => {
  // If no sections configured, fall back to default behavior
  if (sections.length === 0) {
    const sections = [
      <GeneralInfoSection key="general" profile={profile} styles={styles} />,
      <ExperienceSection key="experience" profile={profile} styles={styles} />,
      <EducationSection key="education" profile={profile} styles={styles} />,
      <SkillsSection key="skills" profile={profile} styles={styles} />,
      <ProjectsSection key="projects" profile={profile} styles={styles} />,
      <TrainingsSection key="trainings" profile={profile} styles={styles} />,
      <AchievementsSection key="achievements" profile={profile} styles={styles} />
    ].filter(Boolean);
  
    // Simple logic to distribute content across pages
    const sectionsPerPage = Math.ceil(sections.length / totalPages);
    const startIndex = (pageNumber - 1) * sectionsPerPage;
    const endIndex = startIndex + sectionsPerPage;
    const pageSections = sections.slice(startIndex, endIndex);
  
    return (
      <div style={styles.baseStyles} key={pageNumber}>
        {pageNumber === 1 && (
          <GeneralInfoSection profile={profile} styles={styles} />
        )}
        {pageNumber > 1 && pageSections.map((section, index) => (
          <div key={index}>{section}</div>
        ))}
        {pageNumber === 1 && sections.slice(1, sectionsPerPage).map((section, index) => (
          <div key={index}>{section}</div>
        ))}
      </div>
    );
  }

  // Calculate which sections to show on this page
  const sectionsPerPage = Math.ceil(sections.length / totalPages);
  const startIndex = (pageNumber - 1) * sectionsPerPage;
  const endIndex = startIndex + sectionsPerPage;
  const pageSections = sections.slice(startIndex, endIndex);

  return (
    <div style={styles.baseStyles} key={pageNumber}>
      <DynamicSectionRenderer
        sections={pageSections}
        fieldMappings={fieldMappings}
        profile={profile}
        styles={styles}
      />
    </div>
  );
};
