
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
    orientation: string,
    layoutType: string = 'single-column',
    placement: 'main' | 'sidebar' = 'main'
  ): { currentPage: PageContent; newPageHeight: number } {
    console.log(`Handling non-splittable section ${section.section_type} with layout context: ${layoutType}/${placement}`);
    
    // Use layout-aware height estimation
    const estimatedHeight = SectionSplitter.estimateSectionHeightWithLayout(
      section.section_type, 
      Array.isArray(sectionData) ? sectionData : [sectionData],
      layoutType,
      placement,
      orientation
    );
    
    console.log(`Estimated height for ${section.section_type} (${layoutType}/${placement}): ${estimatedHeight}`);
    
    let updatedCurrentPage = currentPage;
    let newPageHeight = currentPageHeight;

    if (currentPageHeight + estimatedHeight > contentHeight && currentPage.sections.length > 0) {
      console.log(`Section ${section.section_type} doesn't fit, creating new page`);
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
