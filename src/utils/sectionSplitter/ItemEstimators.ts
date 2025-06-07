
import { SectionSplitterConstants } from './constants';
import { TextEstimators } from './TextEstimators';
import { LayoutDimensions } from './LayoutDimensions';

export class ItemEstimators {
  static estimateProjectItemHeight(
    project: any, 
    layoutType: string = 'single-column',
    placement: 'main' | 'sidebar' = 'main'
  ): number {
    const baseHeight = this.getBaseItemHeight(layoutType, placement);
    
    const descriptionHeight = project.description 
      ? TextEstimators.estimateRichTextHeight(project.description, layoutType, placement)
      : 0;
    
    const techHeight = project.technologies_used 
      ? TextEstimators.estimateTechnologiesHeight(project.technologies_used, layoutType, placement)
      : 0;
    
    const urlHeight = project.url ? this.getUrlHeight(layoutType, placement) : 0;
    
    // Apply layout-specific safety multiplier with enhanced multipliers for narrow layouts
    const safetyMultiplier = this.getEnhancedSafetyMultiplier(layoutType, placement, project.description);
    const totalHeight = (baseHeight + descriptionHeight + techHeight + urlHeight + SectionSplitterConstants.ITEM_MARGIN) * safetyMultiplier;
    
    console.log(`Project height estimation (${layoutType}/${placement}): 
      - Base: ${baseHeight}
      - Description: ${descriptionHeight}
      - Tech: ${techHeight}
      - URL: ${urlHeight}
      - Safety multiplier: ${safetyMultiplier}
      - Total: ${totalHeight}`);
    
    return totalHeight;
  }

  static estimateExperienceItemHeight(
    exp: any, 
    layoutType: string = 'single-column',
    placement: 'main' | 'sidebar' = 'main'
  ): number {
    const baseHeight = this.getBaseItemHeight(layoutType, placement) + 10; // Experience has more header info
    const descriptionHeight = exp.description 
      ? TextEstimators.estimateRichTextHeight(exp.description, layoutType, placement)
      : 0;
    
    const safetyMultiplier = this.getEnhancedSafetyMultiplier(layoutType, placement, exp.description);
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
    
    const safetyMultiplier = LayoutDimensions.getSafetyMultiplier(layoutType, placement);
    return (baseHeight + departmentHeight + gpaHeight + SectionSplitterConstants.ITEM_MARGIN) * safetyMultiplier;
  }

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

  private static getEnhancedSafetyMultiplier(layoutType: string, placement: 'main' | 'sidebar', description?: string): number {
    let baseSafetyMultiplier = LayoutDimensions.getSafetyMultiplier(layoutType, placement);
    
    // Additional multiplier for long descriptions in narrow layouts
    if (description && description.length > 200) {
      switch (layoutType) {
        case 'sidebar':
          baseSafetyMultiplier *= placement === 'sidebar' ? 1.3 : 1.2;
          break;
        case 'two-column':
          baseSafetyMultiplier *= 1.25;
          break;
      }
    }
    
    // Additional multiplier for rich HTML content in narrow layouts
    if (description && this.hasComplexHTML(description)) {
      switch (layoutType) {
        case 'sidebar':
          baseSafetyMultiplier *= placement === 'sidebar' ? 1.2 : 1.1;
          break;
        case 'two-column':
          baseSafetyMultiplier *= 1.15;
          break;
      }
    }
    
    return baseSafetyMultiplier;
  }

  private static hasComplexHTML(text: string): boolean {
    if (!text) return false;
    
    // Check for complex HTML structures that might affect layout
    const complexPatterns = [
      /<(ul|ol)>/i,
      /<li>/i,
      /<(p|div).*?>/i,
      /<br\s*\/?>/i
    ];
    
    return complexPatterns.some(pattern => pattern.test(text));
  }
}
