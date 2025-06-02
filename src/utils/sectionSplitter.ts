
interface SectionItem {
  id: string;
  content: any;
  estimatedHeight: number;
}

interface SectionSplit {
  pageItems: SectionItem[];
  remainingItems: SectionItem[];
  sectionTitle?: string;
  continuationTitle?: string;
}

export class SectionSplitter {
  // Updated to handle both portrait and landscape modes
  private static readonly A4_PORTRAIT_HEIGHT = 257 * 3.779528; // 257mm content height in pixels at 96 DPI
  private static readonly A4_LANDSCAPE_HEIGHT = 167 * 3.779528; // 167mm content height in pixels at 96 DPI (297-40-40-50 for margins and header)
  private static readonly SECTION_TITLE_HEIGHT = 30; // Estimated height for section titles
  private static readonly ITEM_MARGIN = 16; // Margin between items

  static getContentHeight(orientation: string = 'portrait'): number {
    return orientation === 'landscape' ? this.A4_LANDSCAPE_HEIGHT : this.A4_PORTRAIT_HEIGHT;
  }

  static canSectionFit(sectionHeight: number, availableHeight: number): boolean {
    return sectionHeight <= availableHeight;
  }

  static splitExperienceSection(
    experiences: any[],
    availableHeight: number,
    sectionTitle: string
  ): SectionSplit {
    const titleHeight = this.SECTION_TITLE_HEIGHT;
    let usedHeight = titleHeight;
    const pageItems: SectionItem[] = [];
    const remainingItems: SectionItem[] = [];

    for (let i = 0; i < experiences.length; i++) {
      const exp = experiences[i];
      const estimatedHeight = this.estimateExperienceItemHeight(exp);
      
      if (usedHeight + estimatedHeight + this.ITEM_MARGIN <= availableHeight) {
        pageItems.push({
          id: `exp-${i}`,
          content: exp,
          estimatedHeight
        });
        usedHeight += estimatedHeight + this.ITEM_MARGIN;
      } else {
        remainingItems.push(...experiences.slice(i).map((item, idx) => ({
          id: `exp-${i + idx}`,
          content: item,
          estimatedHeight: this.estimateExperienceItemHeight(item)
        })));
        break;
      }
    }

    return {
      pageItems,
      remainingItems,
      sectionTitle: pageItems.length > 0 ? sectionTitle : undefined,
      continuationTitle: remainingItems.length > 0 ? `${sectionTitle} (continued)` : undefined
    };
  }

  static splitProjectsSection(
    projects: any[],
    availableHeight: number,
    sectionTitle: string
  ): SectionSplit {
    const titleHeight = this.SECTION_TITLE_HEIGHT;
    let usedHeight = titleHeight;
    const pageItems: SectionItem[] = [];
    const remainingItems: SectionItem[] = [];

    for (let i = 0; i < projects.length; i++) {
      const project = projects[i];
      const estimatedHeight = this.estimateProjectItemHeight(project);
      
      if (usedHeight + estimatedHeight + this.ITEM_MARGIN <= availableHeight) {
        pageItems.push({
          id: `proj-${i}`,
          content: project,
          estimatedHeight
        });
        usedHeight += estimatedHeight + this.ITEM_MARGIN;
      } else {
        remainingItems.push(...projects.slice(i).map((item, idx) => ({
          id: `proj-${i + idx}`,
          content: item,
          estimatedHeight: this.estimateProjectItemHeight(item)
        })));
        break;
      }
    }

    return {
      pageItems,
      remainingItems,
      sectionTitle: pageItems.length > 0 ? sectionTitle : undefined,
      continuationTitle: remainingItems.length > 0 ? `${sectionTitle} (continued)` : undefined
    };
  }

  static splitEducationSection(
    education: any[],
    availableHeight: number,
    sectionTitle: string
  ): SectionSplit {
    const titleHeight = this.SECTION_TITLE_HEIGHT;
    let usedHeight = titleHeight;
    const pageItems: SectionItem[] = [];
    const remainingItems: SectionItem[] = [];

    for (let i = 0; i < education.length; i++) {
      const edu = education[i];
      const estimatedHeight = this.estimateEducationItemHeight(edu);
      
      if (usedHeight + estimatedHeight + this.ITEM_MARGIN <= availableHeight) {
        pageItems.push({
          id: `edu-${i}`,
          content: edu,
          estimatedHeight
        });
        usedHeight += estimatedHeight + this.ITEM_MARGIN;
      } else {
        remainingItems.push(...education.slice(i).map((item, idx) => ({
          id: `edu-${i + idx}`,
          content: item,
          estimatedHeight: this.estimateEducationItemHeight(item)
        })));
        break;
      }
    }

    return {
      pageItems,
      remainingItems,
      sectionTitle: pageItems.length > 0 ? sectionTitle : undefined,
      continuationTitle: remainingItems.length > 0 ? `${sectionTitle} (continued)` : undefined
    };
  }

  static splitAchievementsSection(achievements: any[], availableHeight: number, sectionTitle: string) {
    const ACHIEVEMENT_HEIGHT = 60; // Estimated height per achievement
    const TITLE_HEIGHT = 30;
    
    let usedHeight = TITLE_HEIGHT; // Start with title height
    const pageItems = [];
    
    for (const achievement of achievements) {
      if (usedHeight + ACHIEVEMENT_HEIGHT <= availableHeight) {
        pageItems.push({
          content: achievement,
          estimatedHeight: ACHIEVEMENT_HEIGHT
        });
        usedHeight += ACHIEVEMENT_HEIGHT;
      } else {
        break;
      }
    }
    
    // If we couldn't fit any items but this is the first section on the page, take at least one
    if (pageItems.length === 0 && usedHeight === TITLE_HEIGHT && achievements.length > 0) {
      pageItems.push({
        content: achievements[0],
        estimatedHeight: ACHIEVEMENT_HEIGHT
      });
    }
    
    const remainingItems = achievements.slice(pageItems.length).map(achievement => ({
      content: achievement,
      estimatedHeight: ACHIEVEMENT_HEIGHT
    }));
    
    return {
      pageItems,
      remainingItems,
      sectionTitle
    };
  }

  private static estimateExperienceItemHeight(exp: any): number {
    const baseHeight = 60; // Title, company, dates
    const descriptionHeight = exp.description ? Math.max(40, exp.description.length * 0.5) : 0;
    return baseHeight + descriptionHeight;
  }

  private static estimateProjectItemHeight(project: any): number {
    const baseHeight = 50; // Title, role, dates
    const descriptionHeight = project.description ? Math.max(30, project.description.length * 0.4) : 0;
    const techHeight = project.technologies_used ? 20 : 0;
    return baseHeight + descriptionHeight + techHeight;
  }

  private static estimateEducationItemHeight(edu: any): number {
    const baseHeight = 40; // Degree, university, dates
    const departmentHeight = edu.department ? 15 : 0;
    const gpaHeight = edu.gpa ? 15 : 0;
    return baseHeight + departmentHeight + gpaHeight;
  }

  static estimateSectionHeight(sectionType: string, data: any[], orientation: string = 'portrait'): number {
    const titleHeight = this.SECTION_TITLE_HEIGHT;
    let contentHeight = 0;

    switch (sectionType) {
      case 'experience':
        contentHeight = data.reduce((sum, item) => sum + this.estimateExperienceItemHeight(item) + this.ITEM_MARGIN, 0);
        break;
      case 'projects':
        contentHeight = data.reduce((sum, item) => sum + this.estimateProjectItemHeight(item) + this.ITEM_MARGIN, 0);
        break;
      case 'education':
        contentHeight = data.reduce((sum, item) => sum + this.estimateEducationItemHeight(item) + this.ITEM_MARGIN, 0);
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

    return titleHeight + contentHeight;
  }
}
