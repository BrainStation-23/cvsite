
import React from 'react';
import { LayoutAwarePageRenderer } from './LayoutAwarePageRenderer';
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

interface CVPageRendererProps {
  pageNumber: number;
  totalPages: number;
  profile: any;
  styles: any;
  sections?: TemplateSection[];
  fieldMappings?: FieldMapping[];
  layoutType?: string;
}

export const CVPageRenderer: React.FC<CVPageRendererProps> = ({ 
  pageNumber, 
  totalPages, 
  profile, 
  styles,
  sections = [],
  fieldMappings = [],
  layoutType = 'single-column'
}) => {
  // If sections are configured, use the layout-aware renderer
  if (sections.length > 0) {
    return (
      <LayoutAwarePageRenderer
        pageNumber={pageNumber}
        totalPages={totalPages}
        profile={profile}
        styles={styles}
        sections={sections}
        fieldMappings={fieldMappings}
        layoutType={layoutType}
      />
    );
  }

  // Fallback to default sections if no configuration
  const enhancedProfile = {
    ...profile,
    employee_id: profile.employee_id || profile.id,
    profile_image: profile.profile_image || profile.profileImage,
  };

  const defaultSections = [
    <GeneralInfoSection key="general" profile={enhancedProfile} styles={styles} />,
    <ExperienceSection key="experience" profile={enhancedProfile} styles={styles} />,
    <EducationSection key="education" profile={enhancedProfile} styles={styles} />,
    <SkillsSection key="skills" profile={enhancedProfile} styles={styles} />,
    <ProjectsSection key="projects" profile={enhancedProfile} styles={styles} />,
    <TrainingsSection key="trainings" profile={enhancedProfile} styles={styles} />,
    <AchievementsSection key="achievements" profile={enhancedProfile} styles={styles} />
  ].filter(Boolean);

  // Distribute sections across pages evenly
  const sectionsPerPage = Math.ceil(defaultSections.length / totalPages);
  const startIndex = (pageNumber - 1) * sectionsPerPage;
  const endIndex = startIndex + sectionsPerPage;
  const pageSections = defaultSections.slice(startIndex, endIndex);

  return (
    <div style={styles.baseStyles} key={pageNumber}>
      {pageNumber === 1 && (
        <GeneralInfoSection profile={enhancedProfile} styles={styles} />
      )}
      {pageNumber > 1 && pageSections.map((section, index) => (
        <div key={index}>{section}</div>
      ))}
      {pageNumber === 1 && defaultSections.slice(1, sectionsPerPage).map((section, index) => (
        <div key={index}>{section}</div>
      ))}
    </div>
  );
};
