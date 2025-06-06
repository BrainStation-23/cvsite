
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
    
    // Apply layout-specific safety multiplier
    const safetyMultiplier = LayoutDimensions.getSafetyMultiplier(layoutType, placement);
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
      ? TextEstimators.estimateRichTextHeight(exp.description, layoutType, placement)
      : 0;
    
    const safetyMultiplier = LayoutDimensions.getSafetyMultiplier(layoutType, placement);
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
}
