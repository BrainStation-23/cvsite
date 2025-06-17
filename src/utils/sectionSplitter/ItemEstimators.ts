
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
    
    // Apply layout-specific safety multiplier with reduced multipliers for narrow layouts
    const safetyMultiplier = this.getReducedSafetyMultiplier(layoutType, placement, project.description);
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
    placement: 'main' | 'sidebar' = 'main',
    isDescriptionEnabled: boolean = true,
    enabledFields: string[] = ['designation', 'company_name', 'date_range', 'description']
  ): number {
    // Dynamic per-field heights and margin for main column in multi-column layouts
    let baseHeight = 0;
    let designationHeight = 22;
    let companyNameHeight = 18;
    let dateRangeHeight = 16;
    let itemMargin = SectionSplitterConstants.ITEM_MARGIN;

    // Refine for two-column/sidebar layouts (main placement)
    if ((layoutType === 'two-column' || layoutType === 'sidebar') && placement === 'main') {
      designationHeight = 18;
      companyNameHeight = 14;
      dateRangeHeight = 12;
      itemMargin = 10;
    }

    if (enabledFields.includes('designation')) baseHeight += designationHeight;
    if (enabledFields.includes('company_name')) baseHeight += companyNameHeight;
    if (enabledFields.includes('date_range')) baseHeight += dateRangeHeight;
    // Only count description if enabled
    const descriptionHeight = (isDescriptionEnabled && exp.description)
      ? TextEstimators.estimateRichTextHeight(exp.description, layoutType, placement)
      : 0;
    // Add item margin
    baseHeight += itemMargin;
    // Safety multiplier as before
    const safetyMultiplier = this.getReducedSafetyMultiplier(layoutType, placement, isDescriptionEnabled ? exp.description : undefined);
    return (baseHeight + descriptionHeight) * safetyMultiplier;
  }

  static estimateEducationItemHeight(
    edu: any, 
    layoutType: string = 'single-column',
    placement: 'main' | 'sidebar' = 'main'
  ): number {
    const baseHeight = this.getBaseItemHeight(layoutType, placement) - 10; // Education typically shorter
    const departmentHeight = edu.department ? 15 : 0;
    const gpaHeight = edu.gpa ? 15 : 0;
    
    const safetyMultiplier = this.getReducedSafetyMultiplier(layoutType, placement);
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

  private static getReducedSafetyMultiplier(layoutType: string, placement: 'main' | 'sidebar', description?: string): number {
    // Significantly reduced safety multipliers to prevent oversized estimates
    let baseSafetyMultiplier: number;
    
    switch (layoutType) {
      case 'sidebar':
        baseSafetyMultiplier = placement === 'sidebar' ? 1.25 : 1.15; // Reduced from 1.8/1.4
        break;
      case 'two-column':
        baseSafetyMultiplier = 1.2; // Reduced from 1.5
        break;
      case 'single-column':
      default:
        baseSafetyMultiplier = 1.1; // Reduced from 1.2
    }
    
    // Minimal additional multiplier for long descriptions
    if (description && description.length > 500) {
      baseSafetyMultiplier *= 1.1; // Very conservative increase
    }
    
    // Minimal additional multiplier for rich HTML content
    if (description && this.hasComplexHTML(description)) {
      baseSafetyMultiplier *= 1.05; // Very conservative increase
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
