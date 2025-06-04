
import { BaseExporter } from './BaseExporter';
import { ExportOptions, ExportResult } from '../CVExportService';

export class TXTExporter extends BaseExporter {
  async export(options: ExportOptions): Promise<ExportResult> {
    const { template, profile, sections, fieldMappings } = options;
    
    try {
      console.log('TXT Export - Starting comprehensive plain text export');
      
      if (!profile) {
        throw new Error('Profile data is required for TXT export');
      }
      
      const textContent = this.generateComprehensiveTextCV(profile, template, sections, fieldMappings);
      const blob = new Blob([textContent], { type: 'text/plain' });
      const fileName = this.generateFileName(profile, 'txt');
      
      this.downloadFile(blob, fileName);
      
      return {
        success: true,
        blob,
        url: URL.createObjectURL(blob)
      };
    } catch (error) {
      console.error('TXT export error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'TXT export failed'
      };
    }
  }

  private generateComprehensiveTextCV(profile: any, template: any, sections: any[], fieldMappings: any[]): string {
    let content = '';
    
    // Header with decorative border
    const fullName = `${profile.first_name || ''} ${profile.last_name || ''}`.trim();
    const headerLength = Math.max(60, fullName.length + 20);
    const border = '='.repeat(headerLength);
    
    content += `${border}\n`;
    content += `${' '.repeat(Math.floor((headerLength - fullName.length) / 2))}${fullName}\n`;
    content += `${' '.repeat(Math.floor((headerLength - 'CURRICULUM VITAE'.length) / 2))}CURRICULUM VITAE\n`;
    content += `${border}\n\n`;
    
    // Contact Information
    content += 'CONTACT INFORMATION\n';
    content += '-'.repeat(20) + '\n';
    if (profile.email) content += `Email: ${profile.email}\n`;
    if (profile.phone) content += `Phone: ${profile.phone}\n`;
    if (profile.location) content += `Location: ${profile.location}\n`;
    content += '\n';

    // Biography if available
    if (profile.biography) {
      content += 'BIOGRAPHY\n';
      content += '-'.repeat(9) + '\n';
      content += this.wrapText(profile.biography, 80) + '\n\n';
    }

    // Process sections in order
    const sortedSections = sections.sort((a, b) => a.display_order - b.display_order);
    
    for (const section of sortedSections) {
      const sectionContent = this.generateSectionContent(section, profile);
      if (sectionContent) {
        content += sectionContent + '\n';
      }
    }

    // Footer
    content += '\n' + '='.repeat(headerLength) + '\n';
    content += `Generated from: ${template.name || 'Unknown Template'}\n`;
    content += `Export Date: ${new Date().toLocaleDateString()}\n`;
    content += `Export Time: ${new Date().toLocaleTimeString()}\n`;
    content += '='.repeat(headerLength) + '\n';
    
    return content;
  }

  private generateSectionContent(section: any, profile: any): string {
    const sectionTitle = this.formatSectionTitle(section.section_type);
    let content = `${sectionTitle.toUpperCase()}\n`;
    content += '-'.repeat(sectionTitle.length) + '\n';

    switch (section.section_type) {
      case 'technical_skills':
        return this.generateSkillsSection(content, profile.technical_skills, 'Technical Skills');
      
      case 'specialized_skills':
        return this.generateSkillsSection(content, profile.specialized_skills, 'Specialized Skills');
      
      case 'experience':
        return this.generateExperienceSection(content, profile.experiences);
      
      case 'education':
        return this.generateEducationSection(content, profile.education);
      
      case 'projects':
        return this.generateProjectsSection(content, profile.projects);
      
      case 'trainings':
        return this.generateTrainingsSection(content, profile.trainings);
      
      case 'achievements':
        return this.generateAchievementsSection(content, profile.achievements);
      
      default:
        content += 'No data available for this section.\n';
        return content;
    }
  }

  private generateSkillsSection(content: string, skills: any[], sectionName: string): string {
    if (!skills || skills.length === 0) {
      content += 'No skills listed.\n';
      return content;
    }

    skills.forEach((skill, index) => {
      content += `${index + 1}. ${skill.name}`;
      if (skill.proficiency !== undefined) {
        content += ` (Proficiency: ${skill.proficiency}/10)`;
      }
      content += '\n';
    });

    return content;
  }

  private generateExperienceSection(content: string, experiences: any[]): string {
    if (!experiences || experiences.length === 0) {
      content += 'No work experience listed.\n';
      return content;
    }

    experiences.forEach((exp, index) => {
      content += `${index + 1}. ${exp.designation || 'Position'} at ${exp.company_name || 'Company'}\n`;
      
      const startDate = exp.start_date ? new Date(exp.start_date).toLocaleDateString() : 'Unknown';
      const endDate = exp.is_current ? 'Present' : (exp.end_date ? new Date(exp.end_date).toLocaleDateString() : 'Unknown');
      content += `   Duration: ${startDate} - ${endDate}\n`;
      
      if (exp.description) {
        content += `   Description: ${this.wrapText(exp.description, 70, '   ')}\n`;
      }
      content += '\n';
    });

    return content;
  }

  private generateEducationSection(content: string, education: any[]): string {
    if (!education || education.length === 0) {
      content += 'No education listed.\n';
      return content;
    }

    education.forEach((edu, index) => {
      content += `${index + 1}. ${edu.degree || 'Degree'} in ${edu.department || 'Field'}\n`;
      content += `   Institution: ${edu.university || 'University'}\n`;
      
      const startDate = edu.start_date ? new Date(edu.start_date).toLocaleDateString() : 'Unknown';
      const endDate = edu.is_current ? 'Present' : (edu.end_date ? new Date(edu.end_date).toLocaleDateString() : 'Unknown');
      content += `   Duration: ${startDate} - ${endDate}\n`;
      
      if (edu.gpa) {
        content += `   GPA: ${edu.gpa}\n`;
      }
      content += '\n';
    });

    return content;
  }

  private generateProjectsSection(content: string, projects: any[]): string {
    if (!projects || projects.length === 0) {
      content += 'No projects listed.\n';
      return content;
    }

    projects.forEach((project, index) => {
      content += `${index + 1}. ${project.name || 'Project'}\n`;
      content += `   Role: ${project.role || 'Role not specified'}\n`;
      
      const startDate = project.start_date ? new Date(project.start_date).toLocaleDateString() : 'Unknown';
      const endDate = project.is_current ? 'Present' : (project.end_date ? new Date(project.end_date).toLocaleDateString() : 'Unknown');
      content += `   Duration: ${startDate} - ${endDate}\n`;
      
      if (project.description) {
        content += `   Description: ${this.wrapText(project.description, 70, '   ')}\n`;
      }
      
      if (project.technologies_used && Array.isArray(project.technologies_used)) {
        content += `   Technologies: ${project.technologies_used.join(', ')}\n`;
      }
      
      if (project.url) {
        content += `   URL: ${project.url}\n`;
      }
      content += '\n';
    });

    return content;
  }

  private generateTrainingsSection(content: string, trainings: any[]): string {
    if (!trainings || trainings.length === 0) {
      content += 'No trainings listed.\n';
      return content;
    }

    trainings.forEach((training, index) => {
      content += `${index + 1}. ${training.title || 'Training'}\n`;
      content += `   Provider: ${training.provider || 'Provider not specified'}\n`;
      
      if (training.certification_date) {
        content += `   Certification Date: ${new Date(training.certification_date).toLocaleDateString()}\n`;
      }
      
      if (training.description) {
        content += `   Description: ${this.wrapText(training.description, 70, '   ')}\n`;
      }
      
      if (training.certificate_url) {
        content += `   Certificate URL: ${training.certificate_url}\n`;
      }
      content += '\n';
    });

    return content;
  }

  private generateAchievementsSection(content: string, achievements: any[]): string {
    if (!achievements || achievements.length === 0) {
      content += 'No achievements listed.\n';
      return content;
    }

    achievements.forEach((achievement, index) => {
      content += `${index + 1}. ${achievement.title || 'Achievement'}\n`;
      
      if (achievement.date) {
        content += `   Date: ${new Date(achievement.date).toLocaleDateString()}\n`;
      }
      
      if (achievement.description) {
        content += `   Description: ${this.wrapText(achievement.description, 70, '   ')}\n`;
      }
      content += '\n';
    });

    return content;
  }

  private formatSectionTitle(sectionType: string): string {
    return sectionType
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  private wrapText(text: string, maxLength: number, indent: string = ''): string {
    if (!text) return '';
    
    const words = text.split(' ');
    const lines = [];
    let currentLine = indent;

    for (const word of words) {
      if ((currentLine + word).length > maxLength) {
        if (currentLine.trim()) {
          lines.push(currentLine);
        }
        currentLine = indent + word;
      } else {
        currentLine += (currentLine === indent ? '' : ' ') + word;
      }
    }

    if (currentLine.trim()) {
      lines.push(currentLine);
    }

    return lines.join('\n');
  }
}
