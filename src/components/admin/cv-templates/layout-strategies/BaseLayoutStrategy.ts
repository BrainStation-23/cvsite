
import { TemplateSection, FieldMapping, PageContent } from './LayoutStrategyInterface';
import { SectionDataUtils } from '../utils/SectionDataUtils';
import { SectionSplitter } from '@/utils/sectionSplitter';

export abstract class BaseLayoutStrategy {
  protected createEmptyPage(pageNumber: number): PageContent {
    return {
      pageNumber,
      sections: [],
      partialSections: {}
    };
  }

  protected shouldStartNewPage(
    currentPageHeight: number,
    estimatedHeight: number,
    contentHeight: number,
    hasExistingSections: boolean
  ): boolean {
    return currentPageHeight + estimatedHeight > contentHeight && hasExistingSections;
  }

  protected getSectionData(profile: any, sectionType: string): any {
    return SectionDataUtils.getSectionData(profile, sectionType);
  }

  protected estimateSectionHeight(
    sectionType: string,
    sectionData: any,
    layoutType: string,
    placement: 'main' | 'sidebar',
    orientation: string
  ): number {
    return SectionSplitter.estimateSectionHeightWithLayout(
      sectionType,
      Array.isArray(sectionData) ? sectionData : [sectionData],
      layoutType,
      placement,
      orientation
    );
  }
}
