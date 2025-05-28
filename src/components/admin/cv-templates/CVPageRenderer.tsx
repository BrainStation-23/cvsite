
import React from 'react';
import { GeneralInfoSection } from './sections/GeneralInfoSection';
import { ExperienceSection } from './sections/ExperienceSection';
import { EducationSection } from './sections/EducationSection';
import { SkillsSection } from './sections/SkillsSection';
import { ProjectsSection } from './sections/ProjectsSection';
import { TrainingsSection } from './sections/TrainingsSection';
import { AchievementsSection } from './sections/AchievementsSection';

interface CVPageRendererProps {
  pageNumber: number;
  totalPages: number;
  profile: any;
  styles: any;
}

export const CVPageRenderer: React.FC<CVPageRendererProps> = ({ 
  pageNumber, 
  totalPages, 
  profile, 
  styles 
}) => {
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
};
