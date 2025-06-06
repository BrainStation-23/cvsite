
import { TemplateSection, FieldMapping, PageContent } from './LayoutStrategyInterface';
import { BaseLayoutStrategy } from './BaseLayoutStrategy';

export class PageProcessor extends BaseLayoutStrategy {
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
    const pages: PageContent[] = [];
    let currentPage: PageContent = this.createEmptyPage(1);
    let currentPageHeight = 0;

    console.log(`Processing ${placement} sections with layout: ${layoutType}`);

    for (const section of sections) {
      // Handle page break sections - force a new page immediately
      if (section.section_type === 'page_break') {
        if (currentPage.sections.length > 0 || Object.keys(currentPage.partialSections).length > 0) {
          pages.push(currentPage);
          currentPage = this.createEmptyPage(pages.length + 1);
          currentPageHeight = 0;
        }
        continue;
      }

      const sectionData = this.getSectionData(profile, section.section_type);
      if (!sectionData || (Array.isArray(sectionData) && sectionData.length === 0)) {
        continue;
      }

      const estimatedHeight = this.estimateSectionHeight(
        section.section_type,
        sectionData,
        layoutType,
        placement,
        orientation
      );

      console.log(`Section ${section.section_type} (${layoutType}/${placement}): estimated height ${estimatedHeight}, current page height: ${currentPageHeight}`);

      // Check if this section fits on the current page
      if (this.shouldStartNewPage(currentPageHeight, estimatedHeight, contentHeight, currentPage.sections.length > 0)) {
        pages.push(currentPage);
        currentPage = this.createEmptyPage(pages.length + 1);
        currentPageHeight = 0;
      }

      currentPage.sections.push(section);
      currentPageHeight += estimatedHeight;
    }

    // Add the last page if it has content
    if (currentPage.sections.length > 0 || Object.keys(currentPage.partialSections).length > 0) {
      pages.push(currentPage);
    }

    return pages;
  }
}
