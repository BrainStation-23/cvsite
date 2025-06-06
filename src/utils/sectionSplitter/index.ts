
import { SectionItem, SectionSplit } from './types';
import { SectionSplitterConstants } from './constants';
import { HeightEstimators } from './heightEstimators';
import { SectionSplitters } from './sectionSplitters';

export class SectionSplitter {
  static getContentHeight(orientation: string = 'portrait'): number {
    return orientation === 'landscape' ? SectionSplitterConstants.A4_LANDSCAPE_HEIGHT : SectionSplitterConstants.A4_PORTRAIT_HEIGHT;
  }

  static canSectionFit(sectionHeight: number, availableHeight: number): boolean {
    return sectionHeight <= availableHeight - SectionSplitterConstants.SAFETY_MARGIN;
  }

  static splitExperienceSection(
    experiences: any[],
    availableHeight: number,
    sectionTitle: string
  ): SectionSplit {
    return SectionSplitters.splitExperienceSection(experiences, availableHeight, sectionTitle);
  }

  static splitProjectsSection(
    projects: any[],
    availableHeight: number,
    sectionTitle: string
  ): SectionSplit {
    return SectionSplitters.splitProjectsSection(projects, availableHeight, sectionTitle);
  }

  static splitEducationSection(
    education: any[],
    availableHeight: number,
    sectionTitle: string
  ): SectionSplit {
    return SectionSplitters.splitEducationSection(education, availableHeight, sectionTitle);
  }

  static splitAchievementsSection(achievements: any[], availableHeight: number, sectionTitle: string) {
    return SectionSplitters.splitAchievementsSection(achievements, availableHeight, sectionTitle);
  }

  static estimateSectionHeight(sectionType: string, data: any[], orientation: string = 'portrait'): number {
    return HeightEstimators.estimateSectionHeight(sectionType, data, orientation);
  }
}

// Re-export types for backward compatibility
export type { SectionItem, SectionSplit };
