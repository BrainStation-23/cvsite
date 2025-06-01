
import React from 'react';
import { createRoot } from 'react-dom/client';
import { HTMLToPDFService, PDFExportOptions } from './HTMLToPDFService';
import { CVPageRenderer } from '@/components/admin/cv-templates/CVPageRenderer';
import { createCVStyles } from '@/components/admin/cv-templates/cv-preview-styles';
import { CVTemplate } from '@/types/cv-templates';

export interface CVPDFExportOptions extends PDFExportOptions {
  template: CVTemplate;
  profile: any;
  sections: any[];
  fieldMappings: any[];
  hidePreviewInfo?: boolean;
}

export class CVToPDFService {
  static async exportCV(options: CVPDFExportOptions): Promise<Blob> {
    const {
      template,
      profile,
      sections,
      fieldMappings,
      hidePreviewInfo = true,
      ...pdfOptions
    } = options;

    // Create styles for the CV
    const styles = createCVStyles(template);

    // Generate the CV HTML content
    const htmlContent = await this.generateCVHTML({
      template,
      profile,
      sections,
      fieldMappings,
      styles,
      hidePreviewInfo
    });

    // Convert HTML to PDF
    const filename = this.generateFileName(profile, template.name);
    return await HTMLToPDFService.exportHTMLStringToPDF(htmlContent, {
      filename,
      format: 'a4',
      orientation: template.orientation || 'portrait',
      margin: 10,
      ...pdfOptions
    });
  }

  private static async generateCVHTML(options: {
    template: CVTemplate;
    profile: any;
    sections: any[];
    fieldMappings: any[];
    styles: any;
    hidePreviewInfo: boolean;
  }): Promise<string> {
    const { template, profile, sections, fieldMappings, styles, hidePreviewInfo } = options;

    // Create a container element
    const container = document.createElement('div');
    container.style.cssText = `
      font-family: Arial, sans-serif;
      background: white;
      padding: 0;
      margin: 0;
    `;

    // Add print-specific styles
    const printStyles = `
      <style>
        @media print {
          body { margin: 0; padding: 0; }
          .cv-page { 
            page-break-after: always; 
            margin: 0;
            box-shadow: none !important;
          }
          .cv-page:last-child { 
            page-break-after: avoid; 
          }
          .preview-info { 
            display: none !important; 
          }
        }
        
        .cv-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          background: white;
        }
        
        .cv-page {
          background: white;
          margin: 0 auto;
          box-sizing: border-box;
        }
        
        ${hidePreviewInfo ? '.preview-info { display: none !important; }' : ''}
        
        /* Ensure proper text rendering */
        * {
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }
      </style>
    `;

    // For now, create a single page (we can extend this later for multi-page support)
    const pageContent = this.renderCVPage({
      pageNumber: 1,
      totalPages: 1,
      profile,
      styles,
      sections,
      fieldMappings,
      layoutType: template.layout_config?.layoutType || 'single-column'
    });

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>CV Export</title>
          ${printStyles}
        </head>
        <body>
          <div class="cv-container">
            ${pageContent}
          </div>
        </body>
      </html>
    `;
  }

  private static renderCVPage(props: {
    pageNumber: number;
    totalPages: number;
    profile: any;
    styles: any;
    sections: any[];
    fieldMappings: any[];
    layoutType: string;
  }): string {
    // This is a simplified HTML version of CVPageRenderer
    // In a real implementation, you might want to use a server-side React renderer
    // For now, we'll create a basic HTML structure
    
    const { profile, styles, sections } = props;
    
    let content = '';
    
    // Add general info section if present
    const generalSection = sections.find(s => s.section_type === 'general');
    if (generalSection && profile) {
      content += `
        <div style="text-align: center; margin-bottom: 20px; border-bottom: 2px solid #1f2937; padding-bottom: 10px;">
          <h1 style="font-size: 24px; font-weight: bold; color: #1f2937; margin: 0 0 5px 0;">
            ${profile.first_name || ''} ${profile.last_name || ''}
          </h1>
          <h2 style="font-size: 16px; color: #6b7280; margin: 0;">
            ${profile.current_designation || ''}
          </h2>
          ${profile.email ? `<p style="margin: 5px 0;">Email: ${profile.email}</p>` : ''}
          ${profile.phone ? `<p style="margin: 5px 0;">Phone: ${profile.phone}</p>` : ''}
        </div>
      `;
    }
    
    // Add other sections
    sections
      .filter(s => s.section_type !== 'general')
      .sort((a, b) => a.display_order - b.display_order)
      .forEach(section => {
        content += this.renderSection(section, profile);
      });

    return `
      <div class="cv-page" style="${this.getPageStyles(styles.baseStyles)}">
        ${content}
      </div>
    `;
  }

  private static renderSection(section: any, profile: any): string {
    const sectionTitle = section.section_type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
    
    let sectionContent = '';
    
    switch (section.section_type) {
      case 'experience':
        sectionContent = this.renderExperienceSection(profile.experiences || []);
        break;
      case 'education':
        sectionContent = this.renderEducationSection(profile.education || []);
        break;
      case 'projects':
        sectionContent = this.renderProjectsSection(profile.projects || []);
        break;
      case 'technical_skills':
        sectionContent = this.renderSkillsSection(profile.technical_skills || []);
        break;
      case 'specialized_skills':
        sectionContent = this.renderSkillsSection(profile.specialized_skills || []);
        break;
      default:
        sectionContent = '<p>Section content not implemented</p>';
    }

    return `
      <div style="margin-bottom: 20px;">
        <h3 style="font-size: 16px; font-weight: bold; color: #1f2937; border-bottom: 1px solid #3b82f6; padding-bottom: 2px; margin-bottom: 10px;">
          ${sectionTitle}
        </h3>
        ${sectionContent}
      </div>
    `;
  }

  private static renderExperienceSection(experiences: any[]): string {
    return experiences.map(exp => `
      <div style="margin-bottom: 15px;">
        <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 5px;">
          <h4 style="font-weight: bold; margin: 0; color: #1f2937;">${exp.designation || ''}</h4>
          <span style="color: #6b7280; font-size: 14px;">
            ${this.formatDateRange(exp.start_date, exp.end_date, exp.is_current)}
          </span>
        </div>
        <p style="color: #6b7280; margin: 0 0 5px 0; font-size: 14px;">${exp.company_name || ''}</p>
        ${exp.description ? `<p style="margin: 5px 0; line-height: 1.4;">${exp.description}</p>` : ''}
      </div>
    `).join('');
  }

  private static renderEducationSection(education: any[]): string {
    return education.map(edu => `
      <div style="margin-bottom: 10px;">
        <div style="display: flex; justify-content: space-between; align-items: start;">
          <div>
            <h4 style="font-weight: bold; margin: 0; color: #1f2937;">${edu.degree || ''}</h4>
            <p style="color: #6b7280; margin: 0; font-size: 14px;">${edu.university || ''}</p>
          </div>
          <span style="color: #6b7280; font-size: 14px;">
            ${edu.graduation_year || ''}
          </span>
        </div>
      </div>
    `).join('');
  }

  private static renderProjectsSection(projects: any[]): string {
    return projects.map(project => `
      <div style="margin-bottom: 15px;">
        <h4 style="font-weight: bold; margin: 0 0 5px 0; color: #1f2937;">${project.name || ''}</h4>
        ${project.description ? `<p style="margin: 5px 0; line-height: 1.4;">${project.description}</p>` : ''}
        ${project.technologies ? `<p style="margin: 5px 0; font-size: 14px; color: #6b7280;"><strong>Technologies:</strong> ${project.technologies}</p>` : ''}
      </div>
    `).join('');
  }

  private static renderSkillsSection(skills: any[]): string {
    return `
      <div style="display: flex; flex-wrap: wrap; gap: 8px;">
        ${skills.map(skill => `
          <span style="background-color: #3b82f6; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px;">
            ${typeof skill === 'string' ? skill : skill.name || skill.skill_name || ''}
          </span>
        `).join('')}
      </div>
    `;
  }

  private static formatDateRange(startDate: string, endDate: string, isCurrent: boolean): string {
    const start = startDate ? new Date(startDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : '';
    const end = isCurrent ? 'Present' : (endDate ? new Date(endDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : '');
    
    if (start && end) {
      return `${start} - ${end}`;
    } else if (start) {
      return start;
    } else if (end) {
      return end;
    }
    return '';
  }

  private static getPageStyles(baseStyles: any): string {
    return Object.entries(baseStyles)
      .map(([key, value]) => {
        const cssKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
        return `${cssKey}: ${value}`;
      })
      .join('; ');
  }

  private static generateFileName(profile: any, templateName: string): string {
    const firstName = profile?.first_name || 'CV';
    const lastName = profile?.last_name || '';
    const name = `${firstName}${lastName ? '_' + lastName : ''}`;
    const template = templateName.replace(/\s+/g, '_');
    return `${name}_${template}_CV.pdf`;
  }
}
