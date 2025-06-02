
import { BaseExporter } from './BaseExporter';
import { ExportOptions, ExportResult } from '../CVExportService';

export class HTMLExporter extends BaseExporter {
  async export(options: ExportOptions): Promise<ExportResult> {
    const { template, profile, sections, fieldMappings, styles } = options;
    
    try {
      console.log('HTML Export - Template:', template.name);
      console.log('HTML Export - Profile:', profile?.first_name, profile?.last_name);
      console.log('HTML Export - Sections:', sections?.length || 0);
      console.log('HTML Export - Field mappings:', fieldMappings?.length || 0);
      
      if (!profile) {
        throw new Error('Profile data is required for HTML export');
      }

      if (!sections || sections.length === 0) {
        throw new Error('At least one section must be configured for HTML export');
      }

      // Generate comprehensive HTML CV
      const htmlContent = this.generateCompleteHTMLCV(profile, template, sections, fieldMappings, styles);
      const blob = new Blob([htmlContent], { type: 'text/html' });
      const fileName = this.generateFileName(profile, 'html');
      
      this.downloadFile(blob, fileName);
      
      return {
        success: true,
        blob,
        url: URL.createObjectURL(blob)
      };
    } catch (error) {
      console.error('HTML export failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'HTML export failed'
      };
    }
  }

  private generateCompleteHTMLCV(profile: any, template: any, sections: any[], fieldMappings: any[], styles: any): string {
    const fullName = `${profile?.first_name || ''} ${profile?.last_name || ''}`.trim();
    const layoutConfig = template.layout_config || {};
    
    // Generate CSS based on template configuration
    const css = this.generateCSS(layoutConfig, template.orientation);
    
    // Generate sections HTML
    const sectionsHTML = this.generateSectionsHTML(sections, profile, fieldMappings);
    
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CV - ${fullName}</title>
    <style>
        ${css}
    </style>
</head>
<body>
    <div class="cv-container">
        ${this.generateHeaderHTML(profile, layoutConfig, fieldMappings)}
        ${sectionsHTML}
    </div>
</body>
</html>`;
  }

  private generateCSS(layoutConfig: any, orientation: string): string {
    const pageWidth = orientation === 'portrait' ? '210mm' : '297mm';
    const pageHeight = orientation === 'portrait' ? '297mm' : '210mm';
    const primaryColor = layoutConfig.primaryColor || '#1f2937';
    const secondaryColor = layoutConfig.secondaryColor || '#6b7280';
    const accentColor = layoutConfig.accentColor || '#3b82f6';
    const primaryFont = layoutConfig.primaryFont || 'Arial';
    const baseFontSize = layoutConfig.baseFontSize || 12;
    const lineHeight = layoutConfig.lineHeight || 1.4;
    const margin = layoutConfig.margin || 20;
    const sectionSpacing = layoutConfig.sectionSpacing || 16;
    const itemSpacing = layoutConfig.itemSpacing || 8;

    return `
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: ${primaryFont}, sans-serif;
            font-size: ${baseFontSize}pt;
            line-height: ${lineHeight};
            color: #333;
            background-color: #f4f4f4;
            margin: 0;
            padding: 20px;
        }
        
        .cv-container {
            max-width: ${pageWidth};
            width: 100%;
            margin: 0 auto;
            background: white;
            padding: ${margin}mm;
            border-radius: 8px;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
            min-height: ${pageHeight};
        }
        
        .header {
            text-align: ${layoutConfig.layoutType === 'single-column' ? 'center' : 'left'};
            margin-bottom: ${sectionSpacing}pt;
            border-bottom: 2px solid ${primaryColor};
            padding-bottom: 10pt;
            display: flex;
            align-items: flex-start;
            gap: 20pt;
        }
        
        .header-content {
            flex: 1;
        }
        
        .profile-image {
            width: 120px;
            height: 120px;
            border-radius: 8px;
            object-fit: cover;
            border: 3px solid ${primaryColor};
            flex-shrink: 0;
        }
        
        .name {
            font-size: ${layoutConfig.headingSize || 24}pt;
            font-weight: bold;
            color: ${primaryColor};
            margin-bottom: 5pt;
        }
        
        .title {
            font-size: ${layoutConfig.subheadingSize || 16}pt;
            color: ${secondaryColor};
            margin-bottom: 5pt;
        }
        
        .contact-info {
            color: ${secondaryColor};
            font-size: ${baseFontSize - 1}pt;
            margin-bottom: 10pt;
        }
        
        .contact-info span {
            margin-right: 15px;
        }
        
        .biography {
            text-align: justify;
            color: #333;
            margin-top: 10pt;
            line-height: 1.5;
        }
        
        .section {
            margin-bottom: ${sectionSpacing}pt;
            page-break-inside: avoid;
        }
        
        .section-title {
            font-size: ${layoutConfig.subheadingSize || 16}pt;
            font-weight: bold;
            color: ${primaryColor};
            border-bottom: 2px solid ${accentColor};
            padding-bottom: 3pt;
            margin-bottom: ${itemSpacing}pt;
            text-transform: uppercase;
            letter-spacing: 0.5pt;
        }
        
        .section-content {
            margin-left: 0;
        }
        
        .item {
            margin-bottom: ${itemSpacing}pt;
            page-break-inside: avoid;
        }
        
        .item-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 3pt;
        }
        
        .item-title {
            font-weight: bold;
            color: ${primaryColor};
            font-size: ${baseFontSize + 1}pt;
        }
        
        .item-subtitle {
            color: ${secondaryColor};
            font-style: italic;
            margin-bottom: 2pt;
        }
        
        .item-date {
            color: ${secondaryColor};
            font-size: ${baseFontSize - 1}pt;
            white-space: nowrap;
        }
        
        .item-description {
            color: #333;
            margin-top: 3pt;
            text-align: justify;
            line-height: 1.5;
        }
        
        .skills-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 10pt;
        }
        
        .skill-category {
            margin-bottom: 10pt;
        }
        
        .skill-category-title {
            font-weight: bold;
            color: ${primaryColor};
            margin-bottom: 5pt;
            font-size: ${baseFontSize}pt;
        }
        
        .skills-list {
            display: flex;
            flex-wrap: wrap;
            gap: 5pt;
        }
        
        .skill-tag {
            background-color: ${accentColor};
            color: white;
            padding: 3pt 8pt;
            border-radius: 12pt;
            font-size: ${baseFontSize - 2}pt;
            white-space: nowrap;
        }
        
        .technologies {
            margin-top: 5pt;
        }
        
        .technologies-label {
            font-weight: bold;
            color: ${primaryColor};
            margin-bottom: 3pt;
        }
        
        .tech-list {
            display: flex;
            flex-wrap: wrap;
            gap: 3pt;
        }
        
        .tech-tag {
            background-color: #f3f4f6;
            color: #374151;
            padding: 2pt 6pt;
            border-radius: 8pt;
            font-size: ${baseFontSize - 2}pt;
            border: 1px solid #d1d5db;
        }
        
        .project-url {
            margin-top: 5pt;
            color: ${accentColor};
            text-decoration: none;
            font-weight: 500;
        }
        
        .project-url:hover {
            text-decoration: underline;
        }
        
        .education-details {
            margin-top: 3pt;
        }
        
        .gpa-info {
            color: ${secondaryColor};
            font-size: ${baseFontSize - 1}pt;
            margin-top: 2pt;
        }
        
        @media print {
            body {
                background-color: white;
                padding: 0;
            }
            
            .cv-container {
                box-shadow: none;
                border-radius: 0;
                max-width: none;
                width: 100%;
                margin: 0;
                padding: ${margin}mm;
            }
        }
        
        @page {
            size: ${orientation === 'portrait' ? 'A4 portrait' : 'A4 landscape'};
            margin: 0;
        }
    `;
  }

  private generateHeaderHTML(profile: any, layoutConfig: any, fieldMappings: any[]): string {
    const fullName = this.applyFieldMasking(`${profile?.first_name || ''} ${profile?.last_name || ''}`.trim(), 'full_name', fieldMappings);
    const email = this.applyFieldMasking(profile?.email, 'email', fieldMappings);
    const phone = this.applyFieldMasking(profile?.phone, 'phone', fieldMappings);
    const location = this.applyFieldMasking(profile?.location, 'location', fieldMappings);
    const currentPosition = this.applyFieldMasking(profile?.current_position, 'current_position', fieldMappings);
    const biography = this.applyFieldMasking(profile?.biography, 'biography', fieldMappings);
    
    const contactInfo = [];
    if (email) contactInfo.push(`<span>📧 ${email}</span>`);
    if (phone) contactInfo.push(`<span>📞 ${phone}</span>`);
    if (location) contactInfo.push(`<span>📍 ${location}</span>`);
    
    return `
        <div class="header">
            <div class="header-content">
                <div class="name">${fullName || 'Your Name'}</div>
                ${currentPosition ? `<div class="title">${currentPosition}</div>` : ''}
                ${contactInfo.length > 0 ? `<div class="contact-info">${contactInfo.join('')}</div>` : ''}
                ${biography ? `<div class="biography">${this.processRichText(biography)}</div>` : ''}
            </div>
            ${profile?.profile_image_url ? `<img src="${profile.profile_image_url}" alt="Profile" class="profile-image" />` : ''}
        </div>
    `;
  }

  private generateSectionsHTML(sections: any[], profile: any, fieldMappings: any[]): string {
    return sections.map(section => {
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
          return this.generateProjectsSection(profile, fieldMappings);
        case 'achievements':
          return this.generateAchievementsSection(profile, fieldMappings);
        case 'trainings':
          return this.generateTrainingsSection(profile, fieldMappings);
        default:
          return '';
      }
    }).join('');
  }

  private generateExperienceSection(profile: any, fieldMappings: any[]): string {
    const experiences = profile?.experiences || [];
    if (experiences.length === 0) return '';

    const experienceItems = experiences.map((exp: any) => {
      const position = this.applyFieldMasking(exp.position, 'position', fieldMappings);
      const company = this.applyFieldMasking(exp.company, 'company', fieldMappings);
      const description = this.applyFieldMasking(exp.description, 'description', fieldMappings);
      const dateRange = this.formatDateRange(exp.start_date, exp.end_date, exp.is_current);
      
      return `
        <div class="item">
          <div class="item-header">
            <div>
              <div class="item-title">${position || 'Position'}</div>
              <div class="item-subtitle">${company || 'Company'}</div>
            </div>
            <div class="item-date">${dateRange}</div>
          </div>
          ${description ? `<div class="item-description">${this.processRichText(description)}</div>` : ''}
        </div>
      `;
    }).join('');

    return `
      <div class="section">
        <div class="section-title">Work Experience</div>
        <div class="section-content">
          ${experienceItems}
        </div>
      </div>
    `;
  }

  private generateEducationSection(profile: any, fieldMappings: any[]): string {
    const education = profile?.education || [];
    if (education.length === 0) return '';

    const educationItems = education.map((edu: any) => {
      const degree = this.applyFieldMasking(edu.degree, 'degree', fieldMappings);
      const institution = this.applyFieldMasking(edu.institution, 'institution', fieldMappings);
      const university = this.applyFieldMasking(edu.university, 'university', fieldMappings);
      const department = this.applyFieldMasking(edu.department, 'department', fieldMappings);
      const gpa = this.applyFieldMasking(edu.gpa, 'gpa', fieldMappings);
      const description = this.applyFieldMasking(edu.description, 'description', fieldMappings);
      const dateRange = this.formatDateRange(edu.start_date, edu.end_date, edu.is_current);
      
      // Use institution name or university name
      const schoolName = institution || university || 'Institution';
      
      return `
        <div class="item">
          <div class="item-header">
            <div>
              <div class="item-title">${degree || 'Degree'}</div>
              <div class="item-subtitle">${schoolName}</div>
              ${department ? `<div class="item-subtitle" style="font-size: 0.9em; margin-top: 2pt;">${department}</div>` : ''}
            </div>
            <div class="item-date">${dateRange}</div>
          </div>
          <div class="education-details">
            ${gpa ? `<div class="gpa-info">GPA: ${gpa}</div>` : ''}
            ${description ? `<div class="item-description">${this.processRichText(description)}</div>` : ''}
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
    const skills = profile?.technical_skills || [];
    if (skills.length === 0) return '';

    const skillTags = skills.map((skill: any) => {
      const skillName = this.applyFieldMasking(skill.name, 'name', fieldMappings);
      return `<span class="skill-tag">${skillName}</span>`;
    }).join('');

    return `
      <div class="section">
        <div class="section-title">Technical Skills</div>
        <div class="section-content">
          <div class="skills-list">
            ${skillTags}
          </div>
        </div>
      </div>
    `;
  }

  private generateSpecializedSkillsSection(profile: any, fieldMappings: any[]): string {
    const skills = profile?.specialized_skills || [];
    if (skills.length === 0) return '';

    const skillTags = skills.map((skill: any) => {
      const skillName = this.applyFieldMasking(skill.name, 'name', fieldMappings);
      return `<span class="skill-tag">${skillName}</span>`;
    }).join('');

    return `
      <div class="section">
        <div class="section-title">Specialized Skills</div>
        <div class="section-content">
          <div class="skills-list">
            ${skillTags}
          </div>
        </div>
      </div>
    `;
  }

  private generateProjectsSection(profile: any, fieldMappings: any[]): string {
    const projects = profile?.projects || [];
    if (projects.length === 0) return '';

    const projectItems = projects.map((project: any) => {
      const name = this.applyFieldMasking(project.name, 'name', fieldMappings);
      const role = this.applyFieldMasking(project.role, 'role', fieldMappings);
      const description = this.applyFieldMasking(project.description, 'description', fieldMappings);
      const url = this.applyFieldMasking(project.url, 'url', fieldMappings);
      const dateRange = this.formatDateRange(project.start_date, project.end_date, project.is_current);
      const techTags = project.technologies_used?.map((tech: string) => 
        `<span class="tech-tag">${tech}</span>`
      ).join('') || '';

      return `
        <div class="item">
          <div class="item-header">
            <div>
              <div class="item-title">${name || 'Project Name'}</div>
              ${role ? `<div class="item-subtitle">${role}</div>` : ''}
            </div>
            <div class="item-date">${dateRange}</div>
          </div>
          ${description ? `<div class="item-description">${this.processRichText(description)}</div>` : ''}
          ${url ? `<div class="project-url"><strong>Project URL:</strong> <a href="${url}" target="_blank" class="project-url">${url}</a></div>` : ''}
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
    const achievements = profile?.achievements || [];
    if (achievements.length === 0) return '';

    const achievementItems = achievements.map((achievement: any) => {
      const title = this.applyFieldMasking(achievement.title, 'title', fieldMappings);
      const description = this.applyFieldMasking(achievement.description, 'description', fieldMappings);
      const date = achievement.date ? new Date(achievement.date).toLocaleDateString('en-US', { 
        month: 'short', 
        year: 'numeric' 
      }) : '';

      return `
        <div class="item">
          <div class="item-header">
            <div class="item-title">${title || 'Achievement'}</div>
            ${date ? `<div class="item-date">${date}</div>` : ''}
          </div>
          ${description ? `<div class="item-description">${this.processRichText(description)}</div>` : ''}
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
    const trainings = profile?.trainings || [];
    if (trainings.length === 0) return '';

    const trainingItems = trainings.map((training: any) => {
      const title = this.applyFieldMasking(training.title, 'title', fieldMappings);
      const provider = this.applyFieldMasking(training.provider, 'provider', fieldMappings);
      const description = this.applyFieldMasking(training.description, 'description', fieldMappings);
      const dateRange = this.formatDateRange(training.start_date, training.end_date, training.is_current);

      return `
        <div class="item">
          <div class="item-header">
            <div>
              <div class="item-title">${title || 'Training'}</div>
              ${provider ? `<div class="item-subtitle">${provider}</div>` : ''}
            </div>
            <div class="item-date">${dateRange}</div>
          </div>
          ${description ? `<div class="item-description">${this.processRichText(description)}</div>` : ''}
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

  private applyFieldMasking(value: any, fieldName: string, fieldMappings: any[]): any {
    if (!value || !fieldMappings) return value;
    
    const mapping = fieldMappings.find(m => m.original_field_name === fieldName);
    if (!mapping || !mapping.is_masked) return value;
    
    if (mapping.mask_value) {
      return mapping.mask_value;
    }
    
    // Default masking behavior
    if (typeof value === 'string') {
      if (value.length <= 3) return '***';
      return value.substring(0, 3) + '***';
    }
    
    return '***';
  }

  private formatDateRange(startDate: string, endDate: string, isCurrent: boolean): string {
    const start = startDate ? new Date(startDate).toLocaleDateString('en-US', { 
      month: 'short', 
      year: 'numeric' 
    }) : '';
    const end = isCurrent ? 'Present' : (endDate ? new Date(endDate).toLocaleDateString('en-US', { 
      month: 'short', 
      year: 'numeric' 
    }) : '');
    
    if (start && end) {
      return `${start} - ${end}`;
    } else if (start) {
      return start;
    } else if (end) {
      return end;
    }
    return '';
  }

  private processRichText(content: string): string {
    if (!content) return '';
    
    // Handle common HTML tags and convert to proper HTML with justified text
    return content
      .replace(/\n/g, '<br>')
      .replace(/<p>/g, '<p style="text-align: justify; margin-bottom: 8pt;">')
      .replace(/<\/p>/g, '</p>')
      .replace(/<strong>/g, '<strong>')
      .replace(/<\/strong>/g, '</strong>')
      .replace(/<em>/g, '<em>')
      .replace(/<\/em>/g, '</em>')
      .replace(/<ul>/g, '<ul style="margin-left: 15pt; margin-bottom: 8pt;">')
      .replace(/<\/ul>/g, '</ul>')
      .replace(/<ol>/g, '<ol style="margin-left: 15pt; margin-bottom: 8pt;">')
      .replace(/<\/ol>/g, '</ol>')
      .replace(/<li>/g, '<li style="margin-bottom: 3pt;">')
      .replace(/<\/li>/g, '</li>');
  }
}
