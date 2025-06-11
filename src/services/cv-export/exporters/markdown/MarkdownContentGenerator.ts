
import { MarkdownSectionRenderer } from './MarkdownSectionRenderer';
import { MarkdownUtils } from './MarkdownUtils';

export class MarkdownContentGenerator {
  static generateMarkdownContent(profile: any, sections: any[], template: any, fieldMappings: any[]): string {
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

  private static renderSection(section: any, profile: any, fieldMappings: any[]): string {
    const sectionType = section.section_type;
    let content = '';
    
    // Skip page breaks and general info (already handled)
    if (sectionType === 'page_break' || sectionType === 'general') {
      return '';
    }
    
    const sectionTitle = MarkdownUtils.getSectionTitle(sectionType);
    const sectionIcon = MarkdownUtils.getSectionIcon(sectionType);
    
    content += `## ${sectionIcon} ${sectionTitle}\n\n`;
    
    const sectionData = MarkdownUtils.getSectionData(profile, sectionType);
    
    if (!sectionData || sectionData.length === 0) {
      content += `*No ${sectionTitle.toLowerCase()} information available.*\n\n`;
      return content;
    }
    
    switch (sectionType) {
      case 'technical_skills':
      case 'specialized_skills':
        content += MarkdownSectionRenderer.renderSkillsSection(sectionData);
        break;
      case 'experience':
        content += MarkdownSectionRenderer.renderExperienceSection(sectionData);
        break;
      case 'education':
        content += MarkdownSectionRenderer.renderEducationSection(sectionData);
        break;
      case 'projects':
        content += MarkdownSectionRenderer.renderProjectsSection(sectionData);
        break;
      case 'trainings':
        content += MarkdownSectionRenderer.renderTrainingsSection(sectionData);
        break;
      case 'achievements':
        content += MarkdownSectionRenderer.renderAchievementsSection(sectionData);
        break;
      default:
        content += MarkdownSectionRenderer.renderGenericSection(sectionData);
    }
    
    return content;
  }
}
