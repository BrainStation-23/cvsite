
import { TemplateSection, FieldMapping, PageContent } from './LayoutStrategyInterface';
import { SectionDataUtils } from '../utils/SectionDataUtils';
import { PageUtils } from '../utils/PageUtils';
import { SplittableSectionHandler } from './SplittableSectionHandler';
import { NonSplittableSectionHandler } from './NonSplittableSectionHandler';

export class PageProcessor {
  private splittableSectionHandler = new SplittableSectionHandler();
  private nonSplittableSectionHandler = new NonSplittableSectionHandler();

  processSectionsWithPageBreaks(
    sections: TemplateSection[],
    fieldMappings: FieldMapping[],
    profile: any,
    contentHeight: number,
    maxPages: number,
    orientation: string,
    layoutType: string,
    placement: 'main' | 'sidebar'
  ): PageContent[] {
    const sortedSections = [...sections].sort((a, b) => a.display_order - b.display_order);
    const pages: PageContent[] = [];
    let currentPage: PageContent = {
      pageNumber: 1,
      sections: [],
      partialSections: {}
    };
    let currentPageHeight = 0;

    console.log(`Processing ${placement} sections for ${layoutType} layout:`, sortedSections.map(s => s.section_type));

    for (const section of sortedSections) {
      // Handle page break sections
      if (section.section_type === 'page_break') {
        if (currentPage.sections.length > 0 || Object.keys(currentPage.partialSections).length > 0) {
          pages.push(currentPage);
          currentPage = {
            pageNumber: pages.length + 1,
            sections: [],
            partialSections: {}
          };
          currentPageHeight = 0;
        }
        continue;
      }

      const sectionData = SectionDataUtils.getSectionData(profile, section.section_type);
      const sectionTitle = PageUtils.getSectionTitle(section, fieldMappings);
      
      if (!sectionData || (Array.isArray(sectionData) && sectionData.length === 0)) {
        continue;
      }

      console.log(`Processing ${placement} section: ${section.section_type} (${layoutType}), current page height: ${currentPageHeight}`);

      if (PageUtils.canSectionBeSplit(section.section_type) && Array.isArray(sectionData)) {
        const result = this.splittableSectionHandler.handleSplittableSection(
          section, sectionData, sectionTitle, currentPage, pages, 
          currentPageHeight, contentHeight, maxPages, fieldMappings, layoutType, placement
        );
        currentPageHeight = result.newPageHeight;
        currentPage = result.currentPage;
      } else {
        const result = this.nonSplittableSectionHandler.handleNonSplittableSection(
          section, sectionData, currentPage, pages, 
          currentPageHeight, contentHeight, orientation, layoutType, placement
        );
        currentPageHeight = result.newPageHeight;
        currentPage = result.currentPage;
      }
    }

    if (currentPage.sections.length > 0 || Object.keys(currentPage.partialSections).length > 0) {
      pages.push(currentPage);
    }

    if (pages.length === 0) {
      pages.push({
        pageNumber: 1,
        sections: [],
        partialSections: {}
      });
    }

    console.log(`${placement} processing complete: ${pages.length} pages created`);
    return pages;
  }
}
