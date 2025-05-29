
import React from 'react';

interface ProjectsSectionProps {
  profile: any;
  styles: any;
}

export const ProjectsSection: React.FC<ProjectsSectionProps> = ({ profile, styles }) => {
  if (!profile.projects || profile.projects.length === 0) return null;
  
  // Sort projects by display_order if available
  const sortedProjects = [...profile.projects].sort((a, b) => {
    if (a.display_order !== undefined && b.display_order !== undefined) {
      return a.display_order - b.display_order;
    }
    // Fallback to start_date sorting if display_order is not available
    return new Date(b.start_date).getTime() - new Date(a.start_date).getTime();
  });
  
  return (
    <div style={styles.sectionStyles}>
      <h2 style={styles.sectionTitleStyles}>Projects</h2>
      {sortedProjects.map((project: any, index: number) => (
        <div key={index} style={styles.itemStyles}>
          <div style={styles.itemTitleStyles}>{project.name}</div>
          <div style={styles.itemSubtitleStyles}>
            {project.role} • {project.start_date} - {project.is_current ? 'Present' : project.end_date}
          </div>
          {project.description && (
            <p style={{ marginTop: '3pt', fontSize: '0.9em' }}>{project.description}</p>
          )}
          {project.technologies_used && project.technologies_used.length > 0 && (
            <div style={{ marginTop: '5pt' }}>
              <div style={styles.skillsContainerStyles}>
                {project.technologies_used.map((tech: string, techIndex: number) => (
                  <span key={techIndex} style={{ ...styles.skillStyles, backgroundColor: '#10b981' }}>
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
