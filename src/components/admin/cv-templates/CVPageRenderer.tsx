
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

  // For single page or first page, show all content
  if (totalPages === 1 || pageNumber === 1) {
    return (
      <div style={styles.baseStyles} key={pageNumber}>
        <GeneralInfoSection profile={enhancedProfile} styles={styles} />
        <ExperienceSection profile={enhancedProfile} styles={styles} />
        <EducationSection profile={enhancedProfile} styles={styles} />
        <SkillsSection profile={enhancedProfile} styles={styles} />
        <ProjectsSection profile={enhancedProfile} styles={styles} />
        <TrainingsSection profile={enhancedProfile} styles={styles} />
        <AchievementsSection profile={enhancedProfile} styles={styles} />
      </div>
    );
  }

  // For multiple pages, this is handled by the content distribution logic
  // Return empty pages for now (this will be improved with proper content splitting)
  return (
    <div style={styles.baseStyles} key={pageNumber}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100%',
        color: '#666',
        fontSize: '14px'
      }}>
        Page {pageNumber} (Content distribution in progress...)
      </div>
    </div>
  );
};
