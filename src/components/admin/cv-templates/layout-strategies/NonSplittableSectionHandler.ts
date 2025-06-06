
import { TemplateSection, PageContent } from './LayoutStrategyInterface';
import { SectionSplitter } from '@/utils/sectionSplitter';
import { BaseLayoutStrategy } from './BaseLayoutStrategy';

export class NonSplittableSectionHandler extends BaseLayoutStrategy {
  handleNonSplittableSection(
    section: TemplateSection,
    sectionData: any,
    currentPage: PageContent,
    pages: PageContent[],
    currentPageHeight: number,
    contentHeight: number,
    orientation: string
  ): { currentPage: PageContent; newPageHeight: number } {
    // Use layout-aware height estimation for single column
    const estimatedHeight = SectionSplitter.estimateSectionHeightWithLayout(
      section.section_type, 
      Array.isArray(sectionData) ? sectionData : [sectionData],
      'single-column',
      'main',
      orientation
    );
    
    let updatedCurrentPage = currentPage;
    let newPageHeight = currentPageHeight;

    if (currentPageHeight + estimatedHeight > contentHeight && currentPage.sections.length > 0) {
      pages.push(currentPage);
      updatedCurrentPage = {
        pageNumber: pages.length + 1,
        sections: [],
        partialSections: {}
      };
      newPageHeight = 0;
    }

    updatedCurrentPage.sections.push(section);
    newPageHeight += estimatedHeight;

    return { currentPage: updatedCurrentPage, newPageHeight };
  }
}
