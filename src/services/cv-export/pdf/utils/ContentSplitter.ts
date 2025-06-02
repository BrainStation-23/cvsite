import { ContentBlock } from './PDFPageManager';

export class ContentSplitter {
  static createContentBlocks(sections: any[], profile: any): ContentBlock[] {
    const blocks: ContentBlock[] = [];
    
    for (const section of sections) {
      // Handle page break sections
      if (section.section_type === 'page_break') {
        blocks.push({
          type: 'page_break',
          content: null,
          estimatedHeight: 0,
          minHeight: 0,
          splitData: {
            sectionConfig: section
          }
        });
        continue;
      }

      const sectionData = this.getSectionData(profile, section.section_type);
      
      if (!sectionData || (Array.isArray(sectionData) && sectionData.length === 0)) {
        continue;
      }

      // Create section block
      const sectionBlock: ContentBlock = {
        type: 'section',
        content: sectionData,
        estimatedHeight: this.estimateSectionHeight(section.section_type, sectionData),
        canSplit: this.canSectionBeSplit(section.section_type),
        minHeight: 80, // Minimum space needed (title + one item)
        splitData: {
          sectionType: section.section_type,
          sectionConfig: section
        }
      };

      blocks.push(sectionBlock);
    }

    return blocks;
  }

  private static getSectionData(profile: any, sectionType: string): any {
    switch (sectionType) {
      case 'general':
        return profile;
      case 'experience':
        return profile.experiences || [];
      case 'education':
        return profile.education || [];
      case 'projects':
        return profile.projects || [];
      case 'technical_skills':
        return profile.technical_skills || [];
      case 'specialized_skills':
        return profile.specialized_skills || [];
      case 'training':
        return profile.trainings || [];
      case 'achievements':
        return profile.achievements || [];
      default:
        return null;
    }
  }

  private static estimateSectionHeight(sectionType: string, data: any): number {
    const titleHeight = 30;
    let contentHeight = 0;

    switch (sectionType) {
      case 'general':
        contentHeight = 120; // Fixed height for general info
        break;
      case 'experience':
        if (Array.isArray(data)) {
          contentHeight = data.reduce((sum, exp) => {
            return sum + 80 + (exp.description ? Math.min(100, exp.description.length * 0.5) : 0) + 15;
          }, 0);
        }
        break;
      case 'projects':
        if (Array.isArray(data)) {
          contentHeight = data.reduce((sum, proj) => {
            return sum + 60 + (proj.description ? Math.min(80, proj.description.length * 0.4) : 0) + 15;
          }, 0);
        }
        break;
      case 'education':
        contentHeight = Array.isArray(data) ? data.length * 65 : 65;
        break;
      case 'technical_skills':
      case 'specialized_skills':
        contentHeight = Array.isArray(data) ? Math.max(60, data.length * 20) : 60;
        break;
      case 'training':
        contentHeight = Array.isArray(data) ? data.length * 50 : 50;
        break;
      case 'achievements':
        contentHeight = Array.isArray(data) ? data.length * 55 : 55;
        break;
      default:
        contentHeight = 40;
    }

    return titleHeight + contentHeight;
  }

  private static canSectionBeSplit(sectionType: string): boolean {
    return ['experience', 'projects', 'education', 'training', 'achievements'].includes(sectionType);
  }
}
