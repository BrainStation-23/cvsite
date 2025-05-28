
import React from 'react';
import { CVTemplate } from '@/types/cv-templates';

interface CVPreviewProps {
  template: CVTemplate;
  profile: any;
}

const CVPreview: React.FC<CVPreviewProps> = ({ template, profile }) => {
  const layoutConfig = template.layout_config || {};
  
  const pageWidth = template.orientation === 'portrait' ? '210mm' : '297mm';
  const pageHeight = template.orientation === 'portrait' ? '297mm' : '210mm';
  
  const baseStyles = {
    width: pageWidth,
    height: pageHeight,
    margin: '0 auto 20px',
    backgroundColor: 'white',
    boxShadow: '0 0 10px rgba(0,0,0,0.1)',
    padding: `${layoutConfig.margin || 20}mm`,
    fontFamily: layoutConfig.primaryFont || 'Arial, sans-serif',
    fontSize: `${layoutConfig.baseFontSize || 12}pt`,
    lineHeight: layoutConfig.lineHeight || 1.4,
    color: '#333',
    position: 'relative' as const,
    pageBreakAfter: 'always' as const
  };

  const headerStyles = {
    textAlign: 'center' as const,
    marginBottom: `${layoutConfig.sectionSpacing || 16}pt`,
    borderBottom: `2px solid ${layoutConfig.primaryColor || '#1f2937'}`,
    paddingBottom: '10pt'
  };

  const nameStyles = {
    fontSize: `${layoutConfig.headingSize || 16}pt`,
    fontWeight: 'bold',
    color: layoutConfig.primaryColor || '#1f2937',
    margin: '0 0 5pt 0'
  };

  const titleStyles = {
    fontSize: `${layoutConfig.subheadingSize || 14}pt`,
    color: layoutConfig.secondaryColor || '#6b7280',
    margin: '0'
  };

  const sectionStyles = {
    marginBottom: `${layoutConfig.sectionSpacing || 16}pt`
  };

  const sectionTitleStyles = {
    fontSize: `${layoutConfig.subheadingSize || 14}pt`,
    fontWeight: 'bold',
    color: layoutConfig.primaryColor || '#1f2937',
    borderBottom: `1px solid ${layoutConfig.accentColor || '#3b82f6'}`,
    paddingBottom: '2pt',
    marginBottom: `${layoutConfig.itemSpacing || 8}pt`
  };

  const itemStyles = {
    marginBottom: `${layoutConfig.itemSpacing || 8}pt`
  };

  const itemTitleStyles = {
    fontWeight: 'bold',
    color: layoutConfig.primaryColor || '#1f2937'
  };

  const itemSubtitleStyles = {
    color: layoutConfig.secondaryColor || '#6b7280',
    fontSize: '0.9em'
  };

  const skillsContainerStyles = {
    display: 'flex',
    flexWrap: 'wrap' as const,
    gap: '5pt'
  };

  const skillStyles = {
    backgroundColor: layoutConfig.accentColor || '#3b82f6',
    color: 'white',
    padding: '2pt 6pt',
    borderRadius: '3pt',
    fontSize: '0.8em'
  };

  const renderGeneralInfo = () => (
    <div style={headerStyles}>
      <h1 style={nameStyles}>
        {profile.first_name} {profile.last_name}
      </h1>
      <p style={titleStyles}>
        {profile.employee_id && `Employee ID: ${profile.employee_id}`}
      </p>
      {profile.biography && (
        <p style={{ marginTop: '10pt', fontSize: '0.9em', fontStyle: 'italic' }}>
          {profile.biography}
        </p>
      )}
    </div>
  );

  const renderExperience = () => {
    if (!profile.experiences || profile.experiences.length === 0) return null;
    
    return (
      <div style={sectionStyles}>
        <h2 style={sectionTitleStyles}>Work Experience</h2>
        {profile.experiences.map((exp: any, index: number) => (
          <div key={index} style={itemStyles}>
            <div style={itemTitleStyles}>{exp.designation}</div>
            <div style={itemSubtitleStyles}>
              {exp.company_name} • {exp.start_date} - {exp.is_current ? 'Present' : exp.end_date}
            </div>
            {exp.description && (
              <p style={{ marginTop: '3pt', fontSize: '0.9em' }}>{exp.description}</p>
            )}
          </div>
        ))}
      </div>
    );
  };

  const renderEducation = () => {
    if (!profile.education || profile.education.length === 0) return null;
    
    return (
      <div style={sectionStyles}>
        <h2 style={sectionTitleStyles}>Education</h2>
        {profile.education.map((edu: any, index: number) => (
          <div key={index} style={itemStyles}>
            <div style={itemTitleStyles}>{edu.degree}</div>
            <div style={itemSubtitleStyles}>
              {edu.university} • {edu.department} • {edu.start_date} - {edu.is_current ? 'Present' : edu.end_date}
            </div>
            {edu.gpa && (
              <p style={{ marginTop: '3pt', fontSize: '0.9em' }}>GPA: {edu.gpa}</p>
            )}
          </div>
        ))}
      </div>
    );
  };

  const renderSkills = () => {
    const hasSkills = (profile.technical_skills && profile.technical_skills.length > 0) ||
                     (profile.specialized_skills && profile.specialized_skills.length > 0);
    
    if (!hasSkills) return null;
    
    return (
      <div style={sectionStyles}>
        <h2 style={sectionTitleStyles}>Skills</h2>
        
        {profile.technical_skills && profile.technical_skills.length > 0 && (
          <div style={{ marginBottom: '10pt' }}>
            <div style={{ fontWeight: 'bold', marginBottom: '5pt' }}>Technical Skills</div>
            <div style={skillsContainerStyles}>
              {profile.technical_skills.map((skill: any, index: number) => (
                <span key={index} style={skillStyles}>
                  {skill.name} ({skill.proficiency}/10)
                </span>
              ))}
            </div>
          </div>
        )}
        
        {profile.specialized_skills && profile.specialized_skills.length > 0 && (
          <div>
            <div style={{ fontWeight: 'bold', marginBottom: '5pt' }}>Specialized Skills</div>
            <div style={skillsContainerStyles}>
              {profile.specialized_skills.map((skill: any, index: number) => (
                <span key={index} style={skillStyles}>
                  {skill.name} ({skill.proficiency}/10)
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderProjects = () => {
    if (!profile.projects || profile.projects.length === 0) return null;
    
    return (
      <div style={sectionStyles}>
        <h2 style={sectionTitleStyles}>Projects</h2>
        {profile.projects.map((project: any, index: number) => (
          <div key={index} style={itemStyles}>
            <div style={itemTitleStyles}>{project.name}</div>
            <div style={itemSubtitleStyles}>
              {project.role} • {project.start_date} - {project.is_current ? 'Present' : project.end_date}
            </div>
            {project.description && (
              <p style={{ marginTop: '3pt', fontSize: '0.9em' }}>{project.description}</p>
            )}
            {project.technologies_used && project.technologies_used.length > 0 && (
              <div style={{ marginTop: '5pt' }}>
                <div style={skillsContainerStyles}>
                  {project.technologies_used.map((tech: string, techIndex: number) => (
                    <span key={techIndex} style={{ ...skillStyles, backgroundColor: '#10b981' }}>
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  const renderTrainings = () => {
    if (!profile.trainings || profile.trainings.length === 0) return null;
    
    return (
      <div style={sectionStyles}>
        <h2 style={sectionTitleStyles}>Training & Certifications</h2>
        {profile.trainings.map((training: any, index: number) => (
          <div key={index} style={itemStyles}>
            <div style={itemTitleStyles}>{training.title}</div>
            <div style={itemSubtitleStyles}>
              {training.provider} • {training.certification_date}
            </div>
            {training.description && (
              <p style={{ marginTop: '3pt', fontSize: '0.9em' }}>{training.description}</p>
            )}
          </div>
        ))}
      </div>
    );
  };

  const renderAchievements = () => {
    if (!profile.achievements || profile.achievements.length === 0) return null;
    
    return (
      <div style={sectionStyles}>
        <h2 style={sectionTitleStyles}>Achievements</h2>
        {profile.achievements.map((achievement: any, index: number) => (
          <div key={index} style={itemStyles}>
            <div style={itemTitleStyles}>{achievement.title}</div>
            <div style={itemSubtitleStyles}>{achievement.date}</div>
            {achievement.description && (
              <p style={{ marginTop: '3pt', fontSize: '0.9em' }}>{achievement.description}</p>
            )}
          </div>
        ))}
      </div>
    );
  };

  // Split content across multiple pages based on template.pages_count
  const renderPage = (pageNumber: number) => {
    const sections = [
      renderGeneralInfo(),
      renderExperience(),
      renderEducation(),
      renderSkills(),
      renderProjects(),
      renderTrainings(),
      renderAchievements()
    ].filter(Boolean);

    // Simple logic to distribute content across pages
    const sectionsPerPage = Math.ceil(sections.length / template.pages_count);
    const startIndex = (pageNumber - 1) * sectionsPerPage;
    const endIndex = startIndex + sectionsPerPage;
    const pageSections = sections.slice(startIndex, endIndex);

    return (
      <div style={baseStyles} key={pageNumber}>
        {pageNumber === 1 && renderGeneralInfo()}
        {pageNumber > 1 && pageSections.map((section, index) => (
          <div key={index}>{section}</div>
        ))}
        {pageNumber === 1 && sections.slice(1, sectionsPerPage).map((section, index) => (
          <div key={index}>{section}</div>
        ))}
      </div>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: 'fit-content' }}>
      {Array.from({ length: template.pages_count }, (_, index) => 
        renderPage(index + 1)
      )}
    </div>
  );
};

export default CVPreview;
