
export interface CVData {
  profile: any;
  sections: any[];
  fieldMappings: any[];
  styles: any;
}

export class HTMLTemplateGenerator {
  static generateCVHTML(data: CVData): string {
    const { profile, sections, fieldMappings, styles } = data;
    
    console.log('HTMLTemplateGenerator - Generating HTML for profile:', profile?.first_name, profile?.last_name);
    
    const htmlSections = sections.map(section => 
      this.generateSectionHTML(section, profile, fieldMappings, styles)
    ).filter(Boolean).join('\n');
    
    return this.wrapInDocument(htmlSections, styles);
  }

  private static generateSectionHTML(section: any, profile: any, fieldMappings: any[], styles: any): string {
    const sectionType = section.section_type;
    
    console.log('HTMLTemplateGenerator - Generating section:', sectionType);
    
    switch (sectionType) {
      case 'general_info':
        return this.generateGeneralInfoSection(profile, styles);
      case 'experience':
        return this.generateExperienceSection(profile, styles);
      case 'education':
        return this.generateEducationSection(profile, styles);
      case 'projects':
        return this.generateProjectsSection(profile, styles);
      case 'technical_skills':
        return this.generateTechnicalSkillsSection(profile, styles);
      case 'specialized_skills':
        return this.generateSpecializedSkillsSection(profile, styles);
      case 'achievements':
        return this.generateAchievementsSection(profile, styles);
      case 'training':
        return this.generateTrainingsSection(profile, styles);
      default:
        console.warn('HTMLTemplateGenerator - Unknown section type:', sectionType);
        return '';
    }
  }

  private static generateGeneralInfoSection(profile: any, styles: any): string {
    if (!profile) return '';
    
    const name = `${profile.first_name || ''} ${profile.last_name || ''}`.trim();
    const employeeId = profile.employee_id ? `Employee ID: ${profile.employee_id}` : '';
    const biography = profile.biography || '';
    
    let html = '<div class="section general-info">';
    
    // Profile image
    if (profile.profile_image) {
      html += `<div style="text-align: center; margin-bottom: 15px;">
        <img src="${profile.profile_image}" alt="Profile" style="width: 80px; height: 80px; border-radius: 4px; object-fit: cover; border: 1px solid #e5e7eb;" />
      </div>`;
    }
    
    // Name
    if (name) {
      html += `<h1 style="text-align: center; font-size: 24px; font-weight: bold; margin-bottom: 10px; color: #1a202c;">${name}</h1>`;
    }
    
    // Employee ID
    if (employeeId) {
      html += `<p style="text-align: center; font-size: 14px; color: #4a5568; margin-bottom: 10px;">${employeeId}</p>`;
    }
    
    // Biography
    if (biography) {
      html += `<p style="margin-top: 15px; font-size: 14px; font-style: italic; line-height: 1.6; text-align: justify;">${biography}</p>`;
    }
    
    html += '</div>';
    return html;
  }

  private static generateExperienceSection(profile: any, styles: any): string {
    if (!profile.experiences || profile.experiences.length === 0) return '';
    
    let html = '<div class="section experience"><h2 style="font-size: 18px; font-weight: bold; margin-bottom: 15px; border-bottom: 2px solid #1a202c; padding-bottom: 5px;">Work Experience</h2>';
    
    profile.experiences.forEach((exp: any) => {
      html += '<div style="margin-bottom: 20px; page-break-inside: avoid;">';
      
      // Position title
      if (exp.designation) {
        html += `<h3 style="font-size: 16px; font-weight: bold; margin-bottom: 5px; color: #1a202c;">${exp.designation}</h3>`;
      }
      
      // Company name
      if (exp.company_name) {
        html += `<p style="font-size: 14px; font-weight: 600; margin-bottom: 3px; color: #2d3748;">${exp.company_name}</p>`;
      }
      
      // Date range
      const startDate = this.formatDate(exp.start_date);
      const endDate = exp.is_current ? 'Present' : this.formatDate(exp.end_date);
      if (startDate) {
        html += `<p style="font-size: 12px; color: #718096; font-style: italic; margin-bottom: 8px;">${startDate} - ${endDate}</p>`;
      }
      
      // Description
      if (exp.description) {
        const cleanDescription = this.cleanHtmlContent(exp.description);
        html += `<div style="font-size: 13px; line-height: 1.5; text-align: justify;">${cleanDescription}</div>`;
      }
      
      html += '</div>';
    });
    
    html += '</div>';
    return html;
  }

  private static generateEducationSection(profile: any, styles: any): string {
    if (!profile.education || profile.education.length === 0) return '';
    
    let html = '<div class="section education"><h2 style="font-size: 18px; font-weight: bold; margin-bottom: 15px; border-bottom: 2px solid #1a202c; padding-bottom: 5px;">Education</h2>';
    
    profile.education.forEach((edu: any) => {
      html += '<div style="margin-bottom: 15px; page-break-inside: avoid;">';
      
      // Degree
      if (edu.degree) {
        html += `<h3 style="font-size: 16px; font-weight: bold; margin-bottom: 5px; color: #1a202c;">${edu.degree}</h3>`;
      }
      
      // University and Department
      const universityInfo = [edu.university, edu.department].filter(Boolean).join(', ');
      if (universityInfo) {
        html += `<p style="font-size: 14px; font-weight: 600; margin-bottom: 3px; color: #2d3748;">${universityInfo}</p>`;
      }
      
      // Date range
      const startDate = this.formatDate(edu.start_date);
      const endDate = edu.is_current ? 'Present' : this.formatDate(edu.end_date);
      if (startDate) {
        html += `<p style="font-size: 12px; color: #718096; font-style: italic; margin-bottom: 5px;">${startDate} - ${endDate}</p>`;
      }
      
      // GPA
      if (edu.gpa) {
        html += `<p style="font-size: 13px; margin-top: 5px;">GPA: ${edu.gpa}</p>`;
      }
      
      html += '</div>';
    });
    
    html += '</div>';
    return html;
  }

  private static generateProjectsSection(profile: any, styles: any): string {
    if (!profile.projects || profile.projects.length === 0) return '';
    
    let html = '<div class="section projects"><h2 style="font-size: 18px; font-weight: bold; margin-bottom: 15px; border-bottom: 2px solid #1a202c; padding-bottom: 5px;">Projects</h2>';
    
    profile.projects.forEach((project: any) => {
      html += '<div style="margin-bottom: 20px; page-break-inside: avoid;">';
      
      // Project name
      if (project.name) {
        html += `<h3 style="font-size: 16px; font-weight: bold; margin-bottom: 5px; color: #1a202c;">${project.name}</h3>`;
      }
      
      // Role
      if (project.role) {
        html += `<p style="font-size: 14px; font-weight: 600; margin-bottom: 3px; color: #2d3748;">${project.role}</p>`;
      }
      
      // Date range
      const startDate = this.formatDate(project.start_date);
      const endDate = project.is_current ? 'Present' : this.formatDate(project.end_date);
      if (startDate) {
        html += `<p style="font-size: 12px; color: #718096; font-style: italic; margin-bottom: 8px;">${startDate} - ${endDate}</p>`;
      }
      
      // Description
      if (project.description) {
        html += `<p style="font-size: 13px; line-height: 1.5; margin-bottom: 8px; text-align: justify;">${project.description}</p>`;
      }
      
      // Technologies
      if (project.technologies_used && project.technologies_used.length > 0) {
        const techList = project.technologies_used.join(', ');
        html += `<p style="font-size: 12px; color: #4a5568;"><strong>Technologies:</strong> ${techList}</p>`;
      }
      
      // URL
      if (project.url) {
        html += `<p style="font-size: 12px; margin-top: 5px;"><strong>URL:</strong> <a href="${project.url}" style="color: #3182ce;">${project.url}</a></p>`;
      }
      
      html += '</div>';
    });
    
    html += '</div>';
    return html;
  }

  private static generateTechnicalSkillsSection(profile: any, styles: any): string {
    if (!profile.technical_skills || profile.technical_skills.length === 0) return '';
    
    let html = '<div class="section technical-skills"><h2 style="font-size: 18px; font-weight: bold; margin-bottom: 15px; border-bottom: 2px solid #1a202c; padding-bottom: 5px;">Technical Skills</h2>';
    html += '<div style="display: flex; flex-wrap: wrap; gap: 8px;">';
    
    profile.technical_skills.forEach((skill: any) => {
      html += `<span style="background: #3182ce; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px; display: inline-block; margin-right: 8px; margin-bottom: 8px;">${skill.name} (${skill.proficiency}/10)</span>`;
    });
    
    html += '</div></div>';
    return html;
  }

  private static generateSpecializedSkillsSection(profile: any, styles: any): string {
    if (!profile.specialized_skills || profile.specialized_skills.length === 0) return '';
    
    let html = '<div class="section specialized-skills"><h2 style="font-size: 18px; font-weight: bold; margin-bottom: 15px; border-bottom: 2px solid #1a202c; padding-bottom: 5px;">Specialized Skills</h2>';
    html += '<div style="display: flex; flex-wrap: wrap; gap: 8px;">';
    
    profile.specialized_skills.forEach((skill: any) => {
      html += `<span style="background: #805ad5; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px; display: inline-block; margin-right: 8px; margin-bottom: 8px;">${skill.name} (${skill.proficiency}/10)</span>`;
    });
    
    html += '</div></div>';
    return html;
  }

  private static generateAchievementsSection(profile: any, styles: any): string {
    if (!profile.achievements || profile.achievements.length === 0) return '';
    
    let html = '<div class="section achievements"><h2 style="font-size: 18px; font-weight: bold; margin-bottom: 15px; border-bottom: 2px solid #1a202c; padding-bottom: 5px;">Achievements</h2>';
    
    profile.achievements.forEach((achievement: any) => {
      html += '<div style="margin-bottom: 15px; page-break-inside: avoid;">';
      
      // Title
      if (achievement.title) {
        html += `<h3 style="font-size: 16px; font-weight: bold; margin-bottom: 5px; color: #1a202c;">${achievement.title}</h3>`;
      }
      
      // Date
      if (achievement.date) {
        html += `<p style="font-size: 12px; color: #718096; font-style: italic; margin-bottom: 5px;">${this.formatDate(achievement.date)}</p>`;
      }
      
      // Description
      if (achievement.description) {
        html += `<p style="font-size: 13px; line-height: 1.5; text-align: justify;">${achievement.description}</p>`;
      }
      
      html += '</div>';
    });
    
    html += '</div>';
    return html;
  }

  private static generateTrainingsSection(profile: any, styles: any): string {
    if (!profile.trainings || profile.trainings.length === 0) return '';
    
    let html = '<div class="section trainings"><h2 style="font-size: 18px; font-weight: bold; margin-bottom: 15px; border-bottom: 2px solid #1a202c; padding-bottom: 5px;">Training & Certifications</h2>';
    
    profile.trainings.forEach((training: any) => {
      html += '<div style="margin-bottom: 15px; page-break-inside: avoid;">';
      
      // Title
      if (training.title) {
        html += `<h3 style="font-size: 16px; font-weight: bold; margin-bottom: 5px; color: #1a202c;">${training.title}</h3>`;
      }
      
      // Provider and Date
      const providerInfo = [training.provider, training.certification_date ? this.formatDate(training.certification_date) : ''].filter(Boolean);
      if (providerInfo.length > 0) {
        html += `<p style="font-size: 14px; font-weight: 600; margin-bottom: 5px; color: #2d3748;">${providerInfo.join(' • ')}</p>`;
      }
      
      // Description
      if (training.description) {
        html += `<p style="font-size: 13px; line-height: 1.5; text-align: justify;">${training.description}</p>`;
      }
      
      html += '</div>';
    });
    
    html += '</div>';
    return html;
  }

  private static formatDate(dateString: string | Date): string {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short' 
      });
    } catch {
      return dateString.toString();
    }
  }

  private static cleanHtmlContent(htmlContent: string): string {
    if (!htmlContent) return '';
    
    // Clean and simplify HTML for better PDF rendering
    return htmlContent
      .replace(/<strong>/g, '<b>')
      .replace(/<\/strong>/g, '</b>')
      .replace(/<em>/g, '<i>')
      .replace(/<\/em>/g, '</i>')
      .replace(/<ul>/g, '<div>')
      .replace(/<\/ul>/g, '</div>')
      .replace(/<ol>/g, '<div>')
      .replace(/<\/ol>/g, '</div>')
      .replace(/<li>/g, '<p style="margin: 2px 0; padding-left: 15px;">• ')
      .replace(/<\/li>/g, '</p>')
      .replace(/<p><\/p>/g, '')
      .replace(/\n\s*\n/g, '\n');
  }

  private static wrapInDocument(content: string, styles: any): string {
    const baseStyles = styles?.baseStyles || {};
    
    return `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <title>CV Export</title>
          <style>
            @page {
              size: A4;
              margin: 20mm;
            }
            
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            
            body {
              font-family: 'Arial', sans-serif;
              font-size: 12pt;
              line-height: 1.6;
              color: #333;
              background: white;
              margin: 0;
              padding: 0;
            }
            
            .cv-container {
              width: 100%;
              max-width: 210mm;
              margin: 0 auto;
              background: white;
              padding: 0;
            }
            
            .section {
              margin-bottom: 25px;
              page-break-inside: avoid;
            }
            
            .section:last-child {
              margin-bottom: 0;
            }
            
            h1, h2, h3, h4, h5, h6 {
              page-break-after: avoid;
            }
            
            /* Skills styling */
            .technical-skills .skill-tag,
            .specialized-skills .skill-tag {
              break-inside: avoid;
              display: inline-block;
            }
            
            /* General responsive adjustments */
            img {
              max-width: 100%;
              height: auto;
            }
            
            /* Print optimizations */
            @media print {
              body {
                font-size: 11pt;
              }
              
              .section {
                margin-bottom: 20px;
              }
            }
          </style>
        </head>
        <body>
          <div class="cv-container">
            ${content}
          </div>
        </body>
      </html>
    `;
  }
}
