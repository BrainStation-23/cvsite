
import { SectionSplitterConstants } from './constants';
import { ItemEstimators } from './ItemEstimators';

export class SectionEstimators {
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
          sum + ItemEstimators.estimateExperienceItemHeight(item, layoutType, placement), 0);
        break;
      case 'projects':
        contentHeight = data.reduce((sum, item) => 
          sum + ItemEstimators.estimateProjectItemHeight(item, layoutType, placement), 0);
        break;
      case 'education':
        contentHeight = data.reduce((sum, item) => 
          sum + ItemEstimators.estimateEducationItemHeight(item, layoutType, placement), 0);
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
