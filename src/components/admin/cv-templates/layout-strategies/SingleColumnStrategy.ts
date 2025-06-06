
import { LayoutStrategy, PageContent, TemplateSection, FieldMapping } from './LayoutStrategyInterface';
import { SectionDataUtils } from '../utils/SectionDataUtils';
import { PageUtils } from '../utils/PageUtils';
import { SplittableSectionHandler } from './SplittableSectionHandler';
import { NonSplittableSectionHandler } from './NonSplittableSectionHandler';

export class SingleColumnStrategy implements LayoutStrategy {
  private splittableSectionHandler = new SplittableSectionHandler();
  private nonSplittableSectionHandler = new NonSplittableSectionHandler();

  distribute(
    sections: TemplateSection[],
    fieldMappings: FieldMapping[],
    profile: any,
    contentHeight: number,
    maxPages: number,
    orientation: string
  ): PageContent[] {
    const sortedSections = [...sections].sort((a, b) => a.display_order - b.display_order);
    const pages: PageContent[] = [];
    let currentPage: PageContent = {
      pageNumber: 1,
      sections: [],
      partialSections: {}
    };
    let currentPageHeight = 0;

    console.log(`=== SINGLE COLUMN DISTRIBUTION ===`);
    console.log(`Content height: ${contentHeight}, Max pages: ${maxPages}`);

    for (const section of sortedSections) {
      // Handle page break sections - force a new page immediately
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

      console.log(`Processing section: ${section.section_type}, current page height: ${currentPageHeight}`);

      if (PageUtils.canSectionBeSplit(section.section_type) && Array.isArray(sectionData)) {
        const result = this.splittableSectionHandler.handleSplittableSection(
          section, sectionData, sectionTitle, currentPage, pages, 
          currentPageHeight, contentHeight, maxPages, fieldMappings
        );
        currentPageHeight = result.newPageHeight;
        currentPage = result.currentPage;
      } else {
        const result = this.nonSplittableSectionHandler.handleNonSplittableSection(
          section, sectionData, currentPage, pages, 
          currentPageHeight, contentHeight, orientation
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

    console.log(`=== DISTRIBUTION COMPLETE ===`);
    console.log(`Total pages created: ${pages.length}`);

    return pages;
  }
}
