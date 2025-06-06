
import { SectionSplitterConstants } from './constants';

export interface LayoutDimensions {
  contentWidth: number;
  charsPerLine: number;
  techItemsPerLine: number;
  baseLineHeight: number;
}

export class LayoutAwareHeightEstimators {
  // Layout-specific dimensions
  private static readonly LAYOUT_DIMENSIONS = {
    'single-column': {
      contentWidth: 100, // Full width percentage
      charsPerLine: 80,
      techItemsPerLine: 6,
      baseLineHeight: 20
    },
    'two-column': {
      contentWidth: 45, // Roughly 45% width per column
      charsPerLine: 45,
      techItemsPerLine: 3,
      baseLineHeight: 18
    },
    'sidebar': {
      main: {
        contentWidth: 65, // Main content area
        charsPerLine: 55,
        techItemsPerLine: 4,
        baseLineHeight: 19
      },
      sidebar: {
        contentWidth: 30, // Sidebar area
        charsPerLine: 25,
        techItemsPerLine: 2,
        baseLineHeight: 16
      }
    }
  } as const;

  static getLayoutDimensions(layoutType: string, placement: 'main' | 'sidebar' = 'main'): LayoutDimensions {
    switch (layoutType) {
      case 'two-column':
        return this.LAYOUT_DIMENSIONS['two-column'];
      case 'sidebar':
        return placement === 'sidebar' 
          ? this.LAYOUT_DIMENSIONS.sidebar.sidebar 
          : this.LAYOUT_DIMENSIONS.sidebar.main;
      case 'single-column':
      default:
        return this.LAYOUT_DIMENSIONS['single-column'];
    }
  }

  static estimateRichTextHeight(
    text: string, 
    layoutType: string = 'single-column',
    placement: 'main' | 'sidebar' = 'main'
  ): number {
    if (!text) return 0;
    
    const dimensions = this.getLayoutDimensions(layoutType, placement);
    const plainText = text.replace(/<[^>]*>/g, '');
    
    // Calculate lines based on layout-specific chars per line
    const estimatedLines = Math.max(1, Math.ceil(plainText.length / dimensions.charsPerLine));
    
    // Account for rich text formatting
    const htmlTagCount = (text.match(/<[^>]*>/g) || []).length;
    const formatBonus = htmlTagCount * 2;
    
    // Apply layout-specific multipliers for text wrapping
    const layoutMultiplier = this.getTextWrappingMultiplier(layoutType, placement);
    
    return (estimatedLines * dimensions.baseLineHeight * layoutMultiplier) + formatBonus;
  }

  static estimateTechnologiesHeight(
    technologies: string[], 
    layoutType: string = 'single-column',
    placement: 'main' | 'sidebar' = 'main'
  ): number {
    if (!technologies || technologies.length === 0) return 0;
    
    const dimensions = this.getLayoutDimensions(layoutType, placement);
    
    // Calculate lines needed based on layout-specific items per line
    const linesNeeded = Math.ceil(technologies.length / dimensions.techItemsPerLine);
    const lineHeight = this.getTechLineHeight(layoutType, placement);
    
    return linesNeeded * lineHeight + 10; // +10 for label
  }

  static estimateProjectItemHeight(
    project: any, 
    layoutType: string = 'single-column',
    placement: 'main' | 'sidebar' = 'main'
  ): number {
    const baseHeight = this.getBaseItemHeight(layoutType, placement);
    
    const descriptionHeight = project.description 
      ? this.estimateRichTextHeight(project.description, layoutType, placement)
      : 0;
    
    const techHeight = project.technologies_used 
      ? this.estimateTechnologiesHeight(project.technologies_used, layoutType, placement)
      : 0;
    
    const urlHeight = project.url ? this.getUrlHeight(layoutType, placement) : 0;
    
    // Apply layout-specific safety multiplier
    const safetyMultiplier = this.getSafetyMultiplier(layoutType, placement);
    const totalHeight = (baseHeight + descriptionHeight + techHeight + urlHeight + SectionSplitterConstants.ITEM_MARGIN) * safetyMultiplier;
    
    console.log(`Project height estimation (${layoutType}/${placement}): base(${baseHeight}) + desc(${descriptionHeight}) + tech(${techHeight}) + url(${urlHeight}) = ${totalHeight}`);
    
    return totalHeight;
  }

  static estimateExperienceItemHeight(
    exp: any, 
    layoutType: string = 'single-column',
    placement: 'main' | 'sidebar' = 'main'
  ): number {
    const baseHeight = this.getBaseItemHeight(layoutType, placement) + 10; // Experience has more header info
    const descriptionHeight = exp.description 
      ? this.estimateRichTextHeight(exp.description, layoutType, placement)
      : 0;
    
    const safetyMultiplier = this.getSafetyMultiplier(layoutType, placement);
    return (baseHeight + descriptionHeight + SectionSplitterConstants.ITEM_MARGIN) * safetyMultiplier;
  }

  static estimateEducationItemHeight(
    edu: any, 
    layoutType: string = 'single-column',
    placement: 'main' | 'sidebar' = 'main'
  ): number {
    const baseHeight = this.getBaseItemHeight(layoutType, placement) - 10; // Education typically shorter
    const departmentHeight = edu.department ? 15 : 0;
    const gpaHeight = edu.gpa ? 15 : 0;
    
    const safetyMultiplier = this.getSafetyMultiplier(layoutType, placement);
    return (baseHeight + departmentHeight + gpaHeight + SectionSplitterConstants.ITEM_MARGIN) * safetyMultiplier;
  }

  static estimateSectionHeight(
    sectionType: string, 
    data: any[], 
    layoutType: string = 'single-column',
    placement: 'main' | 'sidebar' = 'main',
    orientation: string = 'portrait'
  ): number {
    const titleHeight = SectionSplitterConstants.SECTION_TITLE_HEIGHT;
    let contentHeight = 0;

    switch (sectionType) {
      case 'experience':
        contentHeight = data.reduce((sum, item) => 
          sum + this.estimateExperienceItemHeight(item, layoutType, placement), 0);
        break;
      case 'projects':
        contentHeight = data.reduce((sum, item) => 
          sum + this.estimateProjectItemHeight(item, layoutType, placement), 0);
        break;
      case 'education':
        contentHeight = data.reduce((sum, item) => 
          sum + this.estimateEducationItemHeight(item, layoutType, placement), 0);
        break;
      case 'general':
        // Adjust general info height based on layout and orientation
        const generalMultiplier = this.getGeneralInfoMultiplier(layoutType, placement, orientation);
        contentHeight = 80 * generalMultiplier;
        break;
      case 'technical_skills':
      case 'specialized_skills':
        // Skills sections vary significantly by layout
        contentHeight = this.getSkillsSectionHeight(layoutType, placement);
        break;
      default:
        contentHeight = data.length * this.getDefaultItemHeight(layoutType, placement);
    }

    return titleHeight + contentHeight + SectionSplitterConstants.SAFETY_MARGIN;
  }

  // Helper methods for layout-specific calculations
  private static getBaseItemHeight(layoutType: string, placement: 'main' | 'sidebar'): number {
    switch (layoutType) {
      case 'sidebar':
        return placement === 'sidebar' ? 45 : 55;
      case 'two-column':
        return 50;
      case 'single-column':
      default:
        return 60;
    }
  }

  private static getTechLineHeight(layoutType: string, placement: 'main' | 'sidebar'): number {
    switch (layoutType) {
      case 'sidebar':
        return placement === 'sidebar' ? 20 : 23;
      case 'two-column':
        return 22;
      case 'single-column':
      default:
        return 25;
    }
  }

  private static getUrlHeight(layoutType: string, placement: 'main' | 'sidebar'): number {
    switch (layoutType) {
      case 'sidebar':
        return placement === 'sidebar' ? 15 : 18;
      case 'two-column':
        return 18;
      case 'single-column':
      default:
        return 20;
    }
  }

  private static getSafetyMultiplier(layoutType: string, placement: 'main' | 'sidebar'): number {
    switch (layoutType) {
      case 'sidebar':
        return placement === 'sidebar' ? 1.4 : 1.25; // Sidebar content wraps more
      case 'two-column':
        return 1.3; // Two-column content wraps more than single
      case 'single-column':
      default:
        return 1.2;
    }
  }

  private static getTextWrappingMultiplier(layoutType: string, placement: 'main' | 'sidebar'): number {
    switch (layoutType) {
      case 'sidebar':
        return placement === 'sidebar' ? 1.3 : 1.1;
      case 'two-column':
        return 1.15;
      case 'single-column':
      default:
        return 1.0;
    }
  }

  private static getGeneralInfoMultiplier(layoutType: string, placement: 'main' | 'sidebar', orientation: string): number {
    const baseMultiplier = orientation === 'landscape' ? 0.75 : 1.0;
    
    switch (layoutType) {
      case 'sidebar':
        return baseMultiplier * (placement === 'sidebar' ? 1.2 : 0.9);
      case 'two-column':
        return baseMultiplier * 1.1;
      case 'single-column':
      default:
        return baseMultiplier;
    }
  }

  private static getSkillsSectionHeight(layoutType: string, placement: 'main' | 'sidebar'): number {
    switch (layoutType) {
      case 'sidebar':
        return placement === 'sidebar' ? 80 : 60;
      case 'two-column':
        return 65;
      case 'single-column':
      default:
        return 60;
    }
  }

  private static getDefaultItemHeight(layoutType: string, placement: 'main' | 'sidebar'): number {
    switch (layoutType) {
      case 'sidebar':
        return placement === 'sidebar' ? 25 : 28;
      case 'two-column':
        return 28;
      case 'single-column':
      default:
        return 30;
    }
  }
}
