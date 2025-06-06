
import { SectionSplitterConstants } from './constants';
import { SectionEstimators } from './SectionEstimators';
import { ItemEstimators } from './ItemEstimators';
import { TextEstimators } from './TextEstimators';

export class HeightEstimators {
  static estimateRichTextHeight(text: string, baseLineHeight: number = SectionSplitterConstants.BASE_LINE_HEIGHT): number {
    // Use layout-aware estimation with single-column defaults for backward compatibility
    return TextEstimators.estimateRichTextHeight(text, 'single-column', 'main');
  }

  static estimateTechnologiesHeight(technologies: string[]): number {
    // Use layout-aware estimation with single-column defaults for backward compatibility
    return TextEstimators.estimateTechnologiesHeight(technologies, 'single-column', 'main');
  }

  static estimateExperienceItemHeight(exp: any): number {
    // Use layout-aware estimation with single-column defaults for backward compatibility
    return ItemEstimators.estimateExperienceItemHeight(exp, 'single-column', 'main');
  }

  static estimateProjectItemHeight(project: any): number {
    // Use layout-aware estimation with single-column defaults for backward compatibility
    return ItemEstimators.estimateProjectItemHeight(project, 'single-column', 'main');
  }

  static estimateEducationItemHeight(edu: any): number {
    // Use layout-aware estimation with single-column defaults for backward compatibility
    return ItemEstimators.estimateEducationItemHeight(edu, 'single-column', 'main');
  }

  static estimateSectionHeight(sectionType: string, data: any[], orientation: string = 'portrait'): number {
    // Use layout-aware estimation with single-column defaults for backward compatibility
    return SectionEstimators.estimateSectionHeight(sectionType, data, 'single-column', 'main', orientation);
  }

  // New method for layout-aware estimation
  static estimateSectionHeightWithLayout(
    sectionType: string, 
    data: any[], 
    layoutType: string = 'single-column',
    placement: 'main' | 'sidebar' = 'main',
    orientation: string = 'portrait'
  ): number {
    return SectionEstimators.estimateSectionHeight(sectionType, data, layoutType, placement, orientation);
  }

  static estimateProjectItemHeightWithLayout(
    project: any, 
    layoutType: string = 'single-column',
    placement: 'main' | 'sidebar' = 'main'
  ): number {
    return ItemEstimators.estimateProjectItemHeight(project, layoutType, placement);
  }

  static estimateExperienceItemHeightWithLayout(
    exp: any, 
    layoutType: string = 'single-column',
    placement: 'main' | 'sidebar' = 'main'
  ): number {
    return ItemEstimators.estimateExperienceItemHeight(exp, layoutType, placement);
  }

  static estimateEducationItemHeightWithLayout(
    edu: any, 
    layoutType: string = 'single-column',
    placement: 'main' | 'sidebar' = 'main'
  ): number {
    return ItemEstimators.estimateEducationItemHeight(edu, layoutType, placement);
  }
}
