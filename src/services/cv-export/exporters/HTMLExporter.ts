
import { BaseExporter } from './BaseExporter';
import { ExportOptions, ExportResult } from '../CVExportService';

export class HTMLExporter extends BaseExporter {
  async export(options: ExportOptions): Promise<ExportResult> {
    const { template, profile, sections, fieldMappings, styles } = options;
    
    try {
      console.log('HTML Export - Template:', template.name);
      console.log('HTML Export - Profile:', profile?.first_name, profile?.last_name);
      console.log('HTML Export - Sections:', sections?.length || 0);
      
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
        ${this.generateHeaderHTML(profile, layoutConfig)}
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
        }
        
        .contact-info span {
            margin-right: 15px;
        }
        
        .profile-image {
            width: 120px;
            height: 120px;
            border-radius: 50%;
            object-fit: cover;
            margin: 0 auto 15pt auto;
            display: block;
            border: 3px solid ${primaryColor};
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
        
        .biography {
            text-align: justify;
            color: #333;
            margin-bottom: 10pt;
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

  private generateHeaderHTML(profile: any, layoutConfig: any): string {
    const fullName = `${profile?.first_name || ''} ${profile?.last_name || ''}`.trim();
    const contactInfo = [];
    
    if (profile?.email) contactInfo.push(`<span>📧 ${profile.email}</span>`);
    if (profile?.phone) contactInfo.push(`<span>📞 ${profile.phone}</span>`);
    if (profile?.location) contactInfo.push(`<span>📍 ${profile.location}</span>`);
    
    return `
        <div class="header">
            ${profile?.profile_image_url ? `<img src="${profile.profile_image_url}" alt="Profile" class="profile-image" />` : ''}
            <div class="name">${fullName || 'Your Name'}</div>
            ${profile?.current_position ? `<div class="title">${profile.current_position}</div>` : ''}
            ${contactInfo.length > 0 ? `<div class="contact-info">${contactInfo.join('')}</div>` : ''}
            ${profile?.biography ? `<div class="biography">${this.processRichText(profile.biography)}</div>` : ''}
        </div>
    `;
  }

  private generateSectionsHTML(sections: any[], profile: any, fieldMappings: any[]): string {
    return sections.map(section => {
      switch (section.section_type) {
        case 'experience':
          return this.generateExperienceSection(profile);
        case 'education':
          return this.generateEducationSection(profile);
        case 'technical_skills':
          return this.generateTechnicalSkillsSection(profile);
        case 'specialized_skills':
          return this.generateSpecializedSkillsSection(profile);
        case 'projects':
          return this.generateProjectsSection(profile);
        case 'achievements':
          return this.generateAchievementsSection(profile);
        case 'trainings':
          return this.generateTrainingsSection(profile);
        default:
          return '';
      }
    }).join('');
  }

  private generateExperienceSection(profile: any): string {
    const experiences = profile?.experiences || [];
    if (experiences.length === 0) return '';

    const experienceItems = experiences.map((exp: any) => {
      const dateRange = this.formatDateRange(exp.start_date, exp.end_date, exp.is_current);
      
      return `
        <div class="item">
          <div class="item-header">
            <div>
              <div class="item-title">${exp.position || 'Position'}</div>
              <div class="item-subtitle">${exp.company || 'Company'}</div>
            </div>
            <div class="item-date">${dateRange}</div>
          </div>
          ${exp.description ? `<div class="item-description">${this.processRichText(exp.description)}</div>` : ''}
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

  private generateEducationSection(profile: any): string {
    const education = profile?.education || [];
    if (education.length === 0) return '';

    const educationItems = education.map((edu: any) => {
      const dateRange = this.formatDateRange(edu.start_date, edu.end_date, edu.is_current);
      
      return `
        <div class="item">
          <div class="item-header">
            <div>
              <div class="item-title">${edu.degree || 'Degree'}</div>
              <div class="item-subtitle">${edu.institution || 'Institution'}</div>
            </div>
            <div class="item-date">${dateRange}</div>
          </div>
          ${edu.description ? `<div class="item-description">${this.processRichText(edu.description)}</div>` : ''}
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

  private generateTechnicalSkillsSection(profile: any): string {
    const skills = profile?.technical_skills || [];
    if (skills.length === 0) return '';

    const skillTags = skills.map((skill: any) => 
      `<span class="skill-tag">${skill.name}</span>`
    ).join('');

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

  private generateSpecializedSkillsSection(profile: any): string {
    const skills = profile?.specialized_skills || [];
    if (skills.length === 0) return '';

    const skillTags = skills.map((skill: any) => 
      `<span class="skill-tag">${skill.name}</span>`
    ).join('');

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

  private generateProjectsSection(profile: any): string {
    const projects = profile?.projects || [];
    if (projects.length === 0) return '';

    const projectItems = projects.map((project: any) => {
      const dateRange = this.formatDateRange(project.start_date, project.end_date, project.is_current);
      const techTags = project.technologies_used?.map((tech: string) => 
        `<span class="tech-tag">${tech}</span>`
      ).join('') || '';

      return `
        <div class="item">
          <div class="item-header">
            <div>
              <div class="item-title">${project.name || 'Project Name'}</div>
              ${project.role ? `<div class="item-subtitle">${project.role}</div>` : ''}
            </div>
            <div class="item-date">${dateRange}</div>
          </div>
          ${project.description ? `<div class="item-description">${this.processRichText(project.description)}</div>` : ''}
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

  private generateAchievementsSection(profile: any): string {
    const achievements = profile?.achievements || [];
    if (achievements.length === 0) return '';

    const achievementItems = achievements.map((achievement: any) => {
      const date = achievement.date ? new Date(achievement.date).toLocaleDateString('en-US', { 
        month: 'short', 
        year: 'numeric' 
      }) : '';

      return `
        <div class="item">
          <div class="item-header">
            <div class="item-title">${achievement.title || 'Achievement'}</div>
            ${date ? `<div class="item-date">${date}</div>` : ''}
          </div>
          ${achievement.description ? `<div class="item-description">${this.processRichText(achievement.description)}</div>` : ''}
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

  private generateTrainingsSection(profile: any): string {
    const trainings = profile?.trainings || [];
    if (trainings.length === 0) return '';

    const trainingItems = trainings.map((training: any) => {
      const dateRange = this.formatDateRange(training.start_date, training.end_date, training.is_current);

      return `
        <div class="item">
          <div class="item-header">
            <div>
              <div class="item-title">${training.title || 'Training'}</div>
              ${training.provider ? `<div class="item-subtitle">${training.provider}</div>` : ''}
            </div>
            <div class="item-date">${dateRange}</div>
          </div>
          ${training.description ? `<div class="item-description">${this.processRichText(training.description)}</div>` : ''}
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
    
    // Handle common HTML tags and convert to proper HTML
    return content
      .replace(/\n/g, '<br>')
      .replace(/<p>/g, '<p>')
      .replace(/<\/p>/g, '</p>')
      .replace(/<strong>/g, '<strong>')
      .replace(/<\/strong>/g, '</strong>')
      .replace(/<em>/g, '<em>')
      .replace(/<\/em>/g, '</em>')
      .replace(/<ul>/g, '<ul>')
      .replace(/<\/ul>/g, '</ul>')
      .replace(/<ol>/g, '<ol>')
      .replace(/<\/ol>/g, '</ol>')
      .replace(/<li>/g, '<li>')
      .replace(/<\/li>/g, '</li>');
  }
}
