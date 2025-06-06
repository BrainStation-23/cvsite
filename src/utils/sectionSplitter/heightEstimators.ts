
import { SectionSplitterConstants } from './constants';

export class HeightEstimators {
  static estimateRichTextHeight(text: string, baseLineHeight: number = SectionSplitterConstants.BASE_LINE_HEIGHT): number {
    if (!text) return 0;
    
    // Remove HTML tags for length calculation
    const plainText = text.replace(/<[^>]*>/g, '');
    
    // Estimate lines based on character count (assuming ~80 chars per line)
    const estimatedLines = Math.max(1, Math.ceil(plainText.length / SectionSplitterConstants.CHARS_PER_LINE));
    
    // Account for rich text formatting that might add height
    const htmlTagCount = (text.match(/<[^>]*>/g) || []).length;
    const formatBonus = htmlTagCount * 2; // Small bonus for formatting
    
    return (estimatedLines * baseLineHeight) + formatBonus;
  }

  static estimateTechnologiesHeight(technologies: string[]): number {
    if (!technologies || technologies.length === 0) return 0;
    
    // Estimate based on number of technologies and typical layout
    // Assuming they wrap at ~6 items per line, each line ~25px height
    const linesNeeded = Math.ceil(technologies.length / SectionSplitterConstants.TECH_ITEMS_PER_LINE);
    return linesNeeded * SectionSplitterConstants.TECH_LINE_HEIGHT + 10; // +10 for label
  }

  static estimateExperienceItemHeight(exp: any): number {
    const baseHeight = 60; // Title, company, dates
    const descriptionHeight = exp.description ? this.estimateRichTextHeight(exp.description, 18) : 0;
    return baseHeight + descriptionHeight + SectionSplitterConstants.ITEM_MARGIN;
  }

  static estimateProjectItemHeight(project: any): number {
    const baseHeight = 50; // Title, role, dates
    const descriptionHeight = project.description ? this.estimateRichTextHeight(project.description, 16) : 0;
    const techHeight = project.technologies_used ? this.estimateTechnologiesHeight(project.technologies_used) : 0;
    const urlHeight = project.url ? 20 : 0;
    
    // Add safety margin for better accuracy
    const safetyMultiplier = 1.2;
    const totalHeight = (baseHeight + descriptionHeight + techHeight + urlHeight + SectionSplitterConstants.ITEM_MARGIN) * safetyMultiplier;
    
    console.log(`Project height estimation: base(${baseHeight}) + desc(${descriptionHeight}) + tech(${techHeight}) + url(${urlHeight}) = ${totalHeight}`);
    
    return totalHeight;
  }

  static estimateEducationItemHeight(edu: any): number {
    const baseHeight = 40; // Degree, university, dates
    const departmentHeight = edu.department ? 15 : 0;
    const gpaHeight = edu.gpa ? 15 : 0;
    return baseHeight + departmentHeight + gpaHeight + SectionSplitterConstants.ITEM_MARGIN;
  }

  static estimateSectionHeight(sectionType: string, data: any[], orientation: string = 'portrait'): number {
    const titleHeight = SectionSplitterConstants.SECTION_TITLE_HEIGHT;
    let contentHeight = 0;

    switch (sectionType) {
      case 'experience':
        contentHeight = data.reduce((sum, item) => sum + this.estimateExperienceItemHeight(item), 0);
        break;
      case 'projects':
        contentHeight = data.reduce((sum, item) => sum + this.estimateProjectItemHeight(item), 0);
        break;
      case 'education':
        contentHeight = data.reduce((sum, item) => sum + this.estimateEducationItemHeight(item), 0);
        break;
      case 'general':
        // Adjust general info height based on orientation
        contentHeight = orientation === 'landscape' ? 60 : 80; // Smaller for landscape
        break;
      case 'technical_skills':
      case 'specialized_skills':
        contentHeight = 60; // Fixed height for skills sections
        break;
      default:
        contentHeight = data.length * 30; // Default estimation
    }

    return titleHeight + contentHeight + SectionSplitterConstants.SAFETY_MARGIN;
  }
}
