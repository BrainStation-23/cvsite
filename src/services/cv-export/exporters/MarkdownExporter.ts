
import { BaseExporter } from './BaseExporter';
import { ExportOptions, ExportResult } from '../CVExportService';

export class MarkdownExporter extends BaseExporter {
  async export(options: ExportOptions): Promise<ExportResult> {
    const { template, profile, sections, fieldMappings } = options;
    
    try {
      console.log('Markdown Export - Starting export process');
      
      if (!profile) {
        throw new Error('Profile data is required for Markdown export');
      }

      const markdownContent = this.generateMarkdownContent(profile, sections, template, fieldMappings);
      const blob = new Blob([markdownContent], { type: 'text/markdown' });
      const fileName = this.generateFileName(profile, 'md');
      
      this.downloadFile(blob, fileName);
      
      return {
        success: true,
        blob,
        url: URL.createObjectURL(blob)
      };
    } catch (error) {
      console.error('Markdown export error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Markdown export failed'
      };
    }
  }

  private generateMarkdownContent(profile: any, sections: any[], template: any, fieldMappings: any[]): string {
    let markdown = '';
    
    // Header with name
    const fullName = `${profile.first_name || ''} ${profile.last_name || ''}`.trim();
    markdown += `# ${fullName}\n\n`;
    
    // Profile image if available - check multiple possible fields
    const profileImageUrl = profile.profile_image_url || profile.profile_image || profile.general_information?.profile_image;
    if (profileImageUrl) {
      markdown += `![${fullName} Profile Photo](${profileImageUrl})\n\n`;
    }
    
    // Contact information section
    if (profile.email || profile.phone || profile.location) {
      markdown += '## 📧 Contact Information\n\n';
      if (profile.email) markdown += `- **Email:** [${profile.email}](mailto:${profile.email})\n`;
      if (profile.phone) markdown += `- **Phone:** ${profile.phone}\n`;
      if (profile.location) markdown += `- **Location:** ${profile.location}\n`;
      markdown += '\n';
    }
    
    // Biography/Summary
    if (profile.biography) {
      markdown += '## 👤 About Me\n\n';
      markdown += `${profile.biography}\n\n`;
    }
    
    // Process sections in order
    const sortedSections = sections.sort((a, b) => a.display_order - b.display_order);
    
    sortedSections.forEach(section => {
      const sectionContent = this.renderSection(section, profile, fieldMappings);
      if (sectionContent) {
        markdown += sectionContent;
      }
    });
    
    // Footer
    markdown += '---\n\n';
    markdown += `*CV generated from ${template.name} template*  \n`;
    markdown += `*Export Date: ${new Date().toLocaleDateString()}*\n`;
    
    return markdown;
  }

  private renderSection(section: any, profile: any, fieldMappings: any[]): string {
    const sectionType = section.section_type;
    let content = '';
    
    // Skip page breaks and general info (already handled)
    if (sectionType === 'page_break' || sectionType === 'general') {
      return '';
    }
    
    const sectionTitle = this.getSectionTitle(sectionType);
    const sectionIcon = this.getSectionIcon(sectionType);
    
    content += `## ${sectionIcon} ${sectionTitle}\n\n`;
    
    const sectionData = this.getSectionData(profile, sectionType);
    
    if (!sectionData || sectionData.length === 0) {
      content += `*No ${sectionTitle.toLowerCase()} information available.*\n\n`;
      return content;
    }
    
    switch (sectionType) {
      case 'technical_skills':
      case 'specialized_skills':
        content += this.renderSkillsSection(sectionData);
        break;
      case 'experience':
        content += this.renderExperienceSection(sectionData);
        break;
      case 'education':
        content += this.renderEducationSection(sectionData);
        break;
      case 'projects':
        content += this.renderProjectsSection(sectionData);
        break;
      case 'trainings':
        content += this.renderTrainingsSection(sectionData);
        break;
      case 'achievements':
        content += this.renderAchievementsSection(sectionData);
        break;
      default:
        content += this.renderGenericSection(sectionData);
    }
    
    return content;
  }

  private getSectionData(profile: any, sectionType: string): any[] {
    switch (sectionType) {
      case 'technical_skills':
        return profile.technical_skills || [];
      case 'specialized_skills':
        return profile.specialized_skills || [];
      case 'experience':
        return profile.experiences || [];
      case 'education':
        return profile.education || [];
      case 'projects':
        return profile.projects || [];
      case 'trainings':
        return profile.trainings || [];
      case 'achievements':
        return profile.achievements || [];
      default:
        return [];
    }
  }

  private getSectionTitle(sectionType: string): string {
    const titles: Record<string, string> = {
      technical_skills: 'Technical Skills',
      specialized_skills: 'Specialized Skills',
      experience: 'Professional Experience',
      education: 'Education',
      projects: 'Projects',
      trainings: 'Training & Certifications',
      achievements: 'Achievements & Awards'
    };
    return titles[sectionType] || this.formatSectionTitle(sectionType);
  }

  private getSectionIcon(sectionType: string): string {
    const icons: Record<string, string> = {
      technical_skills: '⚙️',
      specialized_skills: '🎯',
      experience: '💼',
      education: '🎓',
      projects: '🚀',
      trainings: '📜',
      achievements: '🏆'
    };
    return icons[sectionType] || '📋';
  }

  private renderSkillsSection(skills: any[]): string {
    let content = '';
    
    skills.forEach(skill => {
      // Ensure proficiency is a valid number between 1 and 10
      const proficiency = Math.max(1, Math.min(10, parseInt(skill.proficiency) || 1));
      // Create visual representation with stars (scale to 5 stars but show actual number out of 10)
      const starCount = Math.round((proficiency / 10) * 5);
      const filledStars = '★'.repeat(starCount);
      const emptyStars = '☆'.repeat(5 - starCount);
      content += `- **${skill.name}** - ${filledStars}${emptyStars} (${proficiency}/10)\n`;
    });
    
    content += '\n';
    return content;
  }

  private renderExperienceSection(experiences: any[]): string {
    let content = '';
    
    experiences.forEach((exp, index) => {
      content += `### ${exp.designation || 'Position'} at ${exp.company_name || 'Company'}\n\n`;
      
      const startDate = exp.start_date ? new Date(exp.start_date).toLocaleDateString() : '';
      const endDate = exp.is_current ? 'Present' : (exp.end_date ? new Date(exp.end_date).toLocaleDateString() : '');
      
      if (startDate || endDate) {
        content += `**Duration:** ${startDate} - ${endDate}\n\n`;
      }
      
      if (exp.description) {
        content += `${exp.description}\n\n`;
      }
      
      if (index < experiences.length - 1) {
        content += '---\n\n';
      }
    });
    
    return content;
  }

  private renderEducationSection(education: any[]): string {
    let content = '';
    
    education.forEach((edu, index) => {
      content += `### ${edu.degree || 'Degree'}`;
      if (edu.department) {
        content += ` in ${edu.department}`;
      }
      content += '\n\n';
      
      if (edu.university) {
        content += `**Institution:** ${edu.university}\n\n`;
      }
      
      const startDate = edu.start_date ? new Date(edu.start_date).toLocaleDateString() : '';
      const endDate = edu.is_current ? 'Present' : (edu.end_date ? new Date(edu.end_date).toLocaleDateString() : '');
      
      if (startDate || endDate) {
        content += `**Duration:** ${startDate} - ${endDate}\n\n`;
      }
      
      if (edu.gpa) {
        content += `**GPA:** ${edu.gpa}\n\n`;
      }
      
      if (index < education.length - 1) {
        content += '---\n\n';
      }
    });
    
    return content;
  }

  private renderProjectsSection(projects: any[]): string {
    let content = '';
    
    projects.forEach((project, index) => {
      content += `### ${project.name || 'Project'}\n\n`;
      
      if (project.role) {
        content += `**Role:** ${project.role}\n\n`;
      }
      
      const startDate = project.start_date ? new Date(project.start_date).toLocaleDateString() : '';
      const endDate = project.is_current ? 'Present' : (project.end_date ? new Date(project.end_date).toLocaleDateString() : '');
      
      if (startDate || endDate) {
        content += `**Duration:** ${startDate} - ${endDate}\n\n`;
      }
      
      if (project.description) {
        content += `**Description:** ${project.description}\n\n`;
      }
      
      if (project.technologies_used && project.technologies_used.length > 0) {
        const technologies = Array.isArray(project.technologies_used) 
          ? project.technologies_used.join(', ') 
          : project.technologies_used;
        content += `**Technologies:** ${technologies}\n\n`;
      }
      
      if (project.url) {
        content += `**Project URL:** [${project.url}](${project.url})\n\n`;
      }
      
      if (index < projects.length - 1) {
        content += '---\n\n';
      }
    });
    
    return content;
  }

  private renderTrainingsSection(trainings: any[]): string {
    let content = '';
    
    trainings.forEach((training, index) => {
      content += `### ${training.title || 'Training'}\n\n`;
      
      if (training.provider) {
        content += `**Provider:** ${training.provider}\n\n`;
      }
      
      if (training.certification_date) {
        content += `**Date:** ${new Date(training.certification_date).toLocaleDateString()}\n\n`;
      }
      
      if (training.description) {
        content += `**Description:** ${training.description}\n\n`;
      }
      
      if (training.certificate_url) {
        content += `**Certificate:** [View Certificate](${training.certificate_url})\n\n`;
      }
      
      if (index < trainings.length - 1) {
        content += '---\n\n';
      }
    });
    
    return content;
  }

  private renderAchievementsSection(achievements: any[]): string {
    let content = '';
    
    achievements.forEach((achievement, index) => {
      content += `### ${achievement.title || 'Achievement'}\n\n`;
      
      if (achievement.date) {
        content += `**Date:** ${new Date(achievement.date).toLocaleDateString()}\n\n`;
      }
      
      if (achievement.description) {
        content += `${achievement.description}\n\n`;
      }
      
      if (index < achievements.length - 1) {
        content += '---\n\n';
      }
    });
    
    return content;
  }

  private renderGenericSection(data: any[]): string {
    let content = '';
    
    data.forEach((item, index) => {
      content += `### Item ${index + 1}\n\n`;
      content += '```json\n';
      content += JSON.stringify(item, null, 2);
      content += '\n```\n\n';
    });
    
    return content;
  }

  private formatSectionTitle(sectionType: string): string {
    return sectionType
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }
}
