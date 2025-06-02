import { HTMLFieldProcessor } from './HTMLFieldProcessor';

export class HTMLSectionsGenerator {
  private fieldProcessor = new HTMLFieldProcessor();

  generateSectionsHTML(sections: any[], profile: any, fieldMappings: any[]): string {
    console.log('=== SECTIONS GENERATION DEBUG ===');
    
    return sections.map(section => {
      console.log(`Processing section: ${section.section_type}`);
      
      switch (section.section_type) {
        case 'experience':
          return this.generateExperienceSection(profile, fieldMappings);
        case 'education':
          return this.generateEducationSection(profile, fieldMappings);
        case 'technical_skills':
          return this.generateTechnicalSkillsSection(profile, fieldMappings);
        case 'specialized_skills':
          return this.generateSpecializedSkillsSection(profile, fieldMappings);
        case 'projects':
          return this.generateProjectsSection(profile, fieldMappings, section);
        case 'achievements':
          return this.generateAchievementsSection(profile, fieldMappings);
        case 'trainings':
          return this.generateTrainingsSection(profile, fieldMappings);
        default:
          console.log(`Unknown section type: ${section.section_type}`);
          return '';
      }
    }).join('');
  }

  private generateExperienceSection(profile: any, fieldMappings: any[]): string {
    console.log('=== EXPERIENCE SECTION DEBUG ===');
    
    const experiences = profile?.experiences || [];
    if (experiences.length === 0) return '';

    const experienceItems = experiences.map((exp: any) => {
      console.log('Processing experience:', exp);
      
      const designation = this.fieldProcessor.processFieldWithDebug(exp.designation, 'designation', 'experience', fieldMappings);
      const companyName = this.fieldProcessor.processFieldWithDebug(exp.company_name, 'company_name', 'experience', fieldMappings);
      const description = this.fieldProcessor.processFieldWithDebug(exp.description, 'description', 'experience', fieldMappings);
      
      const dateRange = this.fieldProcessor.formatDateRange(exp.start_date, exp.end_date, exp.is_current);
      
      console.log('Experience processed fields:', {
        designation, companyName, description, dateRange
      });
      
      // Only render if both designation and company are visible
      if (designation === null && companyName === null) {
        console.log('Skipping experience item - both designation and company are hidden');
        return '';
      }
      
      return `
        <div class="item">
          <div class="item-header">
            <div>
              ${designation !== null ? `<div class="item-title">${designation || 'Position'}</div>` : ''}
              ${companyName !== null ? `<div class="item-subtitle">${companyName || 'Company'}</div>` : ''}
            </div>
            <div class="item-date">${dateRange}</div>
          </div>
          ${description !== null ? `<div class="item-description">${this.fieldProcessor.processRichText(description)}</div>` : ''}
        </div>
      `;
    }).join('');

    return experienceItems ? `
      <div class="section">
        <div class="section-title">Work Experience</div>
        <div class="section-content">
          ${experienceItems}
        </div>
      </div>
    ` : '';
  }

  private generateEducationSection(profile: any, fieldMappings: any[]): string {
    console.log('=== EDUCATION SECTION DEBUG ===');
    
    const education = profile?.education || [];
    if (education.length === 0) return '';

    const educationItems = education.map((edu: any) => {
      console.log('Processing education:', edu);
      
      const degree = this.fieldProcessor.processFieldWithDebug(edu.degree, 'degree', 'education', fieldMappings);
      const institution = this.fieldProcessor.processFieldWithDebug(edu.institution, 'institution', 'education', fieldMappings);
      const university = this.fieldProcessor.processFieldWithDebug(edu.university, 'university', 'education', fieldMappings);
      const department = this.fieldProcessor.processFieldWithDebug(edu.department, 'department', 'education', fieldMappings);
      const gpa = this.fieldProcessor.processFieldWithDebug(edu.gpa, 'gpa', 'education', fieldMappings);
      const description = this.fieldProcessor.processFieldWithDebug(edu.description, 'description', 'education', fieldMappings);
      
      const dateRange = this.fieldProcessor.formatDateRange(edu.start_date, edu.end_date, edu.is_current);
      
      // Use institution name or university name
      const schoolName = institution || university || 'Institution';
      
      console.log('Education processed fields:', {
        degree, institution, university, department, gpa, description, schoolName, dateRange
      });
      
      return `
        <div class="item">
          <div class="item-header">
            <div>
              ${degree !== null ? `<div class="item-title">${degree || 'Degree'}</div>` : ''}
              ${(institution !== null || university !== null) ? `<div class="item-subtitle">${schoolName}</div>` : ''}
              ${department !== null ? `<div class="item-subtitle" style="font-size: 0.9em; margin-top: 2pt;">${department}</div>` : ''}
            </div>
            <div class="item-date">${dateRange}</div>
          </div>
          <div class="education-details">
            ${gpa !== null ? `<div class="gpa-info">GPA: ${gpa}</div>` : ''}
            ${description !== null ? `<div class="item-description">${this.fieldProcessor.processRichText(description)}</div>` : ''}
          </div>
        </div>
      `;
    }).join('');

    return `
      <div class="section">
        <div class="section-title">Education</div>
        <div class="section-content">
          ${educationItems}
        </div>
      </div>
    `;
  }

  private generateTechnicalSkillsSection(profile: any, fieldMappings: any[]): string {
    console.log('=== TECHNICAL SKILLS SECTION DEBUG ===');
    
    const skills = profile?.technical_skills || [];
    if (skills.length === 0) return '';

    const skillTags = skills.map((skill: any) => {
      const skillName = this.fieldProcessor.processFieldWithDebug(skill.name, 'name', 'technical_skills', fieldMappings);
      return skillName !== null ? `<span class="skill-tag">${skillName}</span>` : '';
    }).filter(Boolean).join('');

    return skillTags ? `
      <div class="section">
        <div class="section-title">Technical Skills</div>
        <div class="section-content">
          <div class="skills-list">
            ${skillTags}
          </div>
        </div>
      </div>
    ` : '';
  }

  private generateSpecializedSkillsSection(profile: any, fieldMappings: any[]): string {
    console.log('=== SPECIALIZED SKILLS SECTION DEBUG ===');
    
    const skills = profile?.specialized_skills || [];
    if (skills.length === 0) return '';

    const skillTags = skills.map((skill: any) => {
      const skillName = this.fieldProcessor.processFieldWithDebug(skill.name, 'name', 'specialized_skills', fieldMappings);
      return skillName !== null ? `<span class="skill-tag">${skillName}</span>` : '';
    }).filter(Boolean).join('');

    return skillTags ? `
      <div class="section">
        <div class="section-title">Specialized Skills</div>
        <div class="section-content">
          <div class="skills-list">
            ${skillTags}
          </div>
        </div>
      </div>
    ` : '';
  }

  private generateProjectsSection(profile: any, fieldMappings: any[], section?: any): string {
    console.log('=== PROJECTS SECTION DEBUG ===');
    
    const projects = profile?.projects || [];
    if (projects.length === 0) return '';

    // Get the maximum number of projects from section configuration
    const maxProjects = section?.styling_config?.items_per_column || projects.length;
    
    // Sort projects by display_order, then by start_date as fallback
    const sortedProjects = [...projects].sort((a, b) => {
      if (a.display_order !== undefined && b.display_order !== undefined) {
        return a.display_order - b.display_order;
      }
      return new Date(b.start_date).getTime() - new Date(a.start_date).getTime();
    });

    // Limit the number of projects to show
    const projectsToShow = sortedProjects.slice(0, maxProjects);
    
    console.log(`Projects section - Total: ${projects.length}, Max to show: ${maxProjects}, Showing: ${projectsToShow.length}`);

    const projectItems = projectsToShow.map((project: any) => {
      console.log('Processing project:', project);
      
      const name = this.fieldProcessor.processFieldWithDebug(project.name, 'name', 'projects', fieldMappings);
      const role = this.fieldProcessor.processFieldWithDebug(project.role, 'role', 'projects', fieldMappings);
      const description = this.fieldProcessor.processFieldWithDebug(project.description, 'description', 'projects', fieldMappings);
      const url = this.fieldProcessor.processFieldWithDebug(project.url, 'url', 'projects', fieldMappings);
      
      const dateRange = this.fieldProcessor.formatDateRange(project.start_date, project.end_date, project.is_current);
      const techTags = project.technologies_used?.map((tech: string) => 
        `<span class="tech-tag">${tech}</span>`
      ).join('') || '';

      console.log('Project processed fields:', {
        name, role, description, url, dateRange, techTags
      });

      return `
        <div class="item">
          <div class="item-header">
            <div>
              ${name !== null ? `<div class="item-title">${name || 'Project Name'}</div>` : ''}
              ${role !== null ? `<div class="item-subtitle">${role}</div>` : ''}
            </div>
            <div class="item-date">${dateRange}</div>
          </div>
          ${description !== null ? `<div class="item-description">${this.fieldProcessor.processRichText(description)}</div>` : ''}
          ${url !== null && url ? `<div class="project-url"><strong>Project URL:</strong> <a href="${url}" target="_blank" class="project-url">${url}</a></div>` : ''}
          ${techTags ? `
            <div class="technologies">
              <div class="technologies-label">Technologies:</div>
              <div class="tech-list">${techTags}</div>
            </div>
          ` : ''}
        </div>
      `;
    }).join('');

    return `
      <div class="section">
        <div class="section-title">Projects</div>
        <div class="section-content">
          ${projectItems}
        </div>
      </div>
    `;
  }

  private generateAchievementsSection(profile: any, fieldMappings: any[]): string {
    console.log('=== ACHIEVEMENTS SECTION DEBUG ===');
    
    const achievements = profile?.achievements || [];
    if (achievements.length === 0) return '';

    const achievementItems = achievements.map((achievement: any) => {
      const title = this.fieldProcessor.processFieldWithDebug(achievement.title, 'title', 'achievements', fieldMappings);
      const description = this.fieldProcessor.processFieldWithDebug(achievement.description, 'description', 'achievements', fieldMappings);
      const date = achievement.date ? new Date(achievement.date).toLocaleDateString('en-US', { 
        month: 'short', 
        year: 'numeric' 
      }) : '';

      return `
        <div class="item">
          <div class="item-header">
            ${title !== null ? `<div class="item-title">${title || 'Achievement'}</div>` : ''}
            ${date ? `<div class="item-date">${date}</div>` : ''}
          </div>
          ${description !== null ? `<div class="item-description">${this.fieldProcessor.processRichText(description)}</div>` : ''}
        </div>
      `;
    }).join('');

    return `
      <div class="section">
        <div class="section-title">Achievements</div>
        <div class="section-content">
          ${achievementItems}
        </div>
      </div>
    `;
  }

  private generateTrainingsSection(profile: any, fieldMappings: any[]): string {
    console.log('=== TRAININGS SECTION DEBUG ===');
    
    const trainings = profile?.trainings || [];
    if (trainings.length === 0) return '';

    const trainingItems = trainings.map((training: any) => {
      const title = this.fieldProcessor.processFieldWithDebug(training.title, 'title', 'trainings', fieldMappings);
      const provider = this.fieldProcessor.processFieldWithDebug(training.provider, 'provider', 'trainings', fieldMappings);
      const description = this.fieldProcessor.processFieldWithDebug(training.description, 'description', 'trainings', fieldMappings);
      const dateRange = this.fieldProcessor.formatDateRange(training.start_date, training.end_date, training.is_current);

      return `
        <div class="item">
          <div class="item-header">
            <div>
              ${title !== null ? `<div class="item-title">${title || 'Training'}</div>` : ''}
              ${provider !== null ? `<div class="item-subtitle">${provider}</div>` : ''}
            </div>
            <div class="item-date">${dateRange}</div>
          </div>
          ${description !== null ? `<div class="item-description">${this.fieldProcessor.processRichText(description)}</div>` : ''}
        </div>
      `;
    }).join('');

    return `
      <div class="section">
        <div class="section-title">Training & Certifications</div>
        <div class="section-content">
          ${trainingItems}
        </div>
      </div>
    `;
  }
}
