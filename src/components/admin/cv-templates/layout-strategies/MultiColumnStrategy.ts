import { SectionSplitter } from '@/utils/sectionSplitter';
import { LayoutStrategy, PageContent, TemplateSection, FieldMapping } from './LayoutStrategyInterface';
import { SectionDataUtils } from '../utils/SectionDataUtils';

export class MultiColumnStrategy implements LayoutStrategy {
  distribute(
    sections: TemplateSection[],
    fieldMappings: FieldMapping[],
    profile: any,
    contentHeight: number,
    maxPages: number,
    orientation: string
  ): PageContent[] {
    const sortedSections = [...sections].sort((a, b) => a.display_order - b.display_order);
    
    // Separate sections by placement, handling page breaks for both columns
    const mainSections = sortedSections.filter(s => 
      (s.styling_config?.layout_placement || 'main') === 'main'
    );
    const sidebarSections = sortedSections.filter(s => 
      (s.styling_config?.layout_placement || 'main') === 'sidebar'
    );

    console.log('Multi-column layout distribution:', {
      mainSections: mainSections.map(s => s.section_type),
      sidebarSections: sidebarSections.map(s => s.section_type)
    });

    const pages: PageContent[] = [];
    
    // Process main sections with page break support
    const mainPages = this.processSectionsWithPageBreaks(mainSections, fieldMappings, profile, contentHeight, maxPages, orientation);
    
    // Process sidebar sections with page break support
    const sidebarPages = this.processSectionsWithPageBreaks(sidebarSections, fieldMappings, profile, contentHeight, maxPages, orientation);
    
    // Combine pages - ensure we have at least as many pages as either column needs
    const totalPages = Math.max(mainPages.length, sidebarPages.length, 1);
    
    for (let pageIndex = 0; pageIndex < totalPages; pageIndex++) {
      const currentPage: PageContent = {
        pageNumber: pageIndex + 1,
        sections: [],
        partialSections: {}
      };

      // Add main sections for this page
      if (mainPages[pageIndex]) {
        currentPage.sections.push(...mainPages[pageIndex].sections);
        Object.assign(currentPage.partialSections, mainPages[pageIndex].partialSections);
      }

      // Add sidebar sections for this page
      if (sidebarPages[pageIndex]) {
        currentPage.sections.push(...sidebarPages[pageIndex].sections);
        Object.assign(currentPage.partialSections, sidebarPages[pageIndex].partialSections);
      }

      pages.push(currentPage);
    }

    // Ensure at least one page
    if (pages.length === 0) {
      pages.push({
        pageNumber: 1,
        sections: [],
        partialSections: {}
      });
    }

    return pages;
  }

  private processSectionsWithPageBreaks(
    sections: TemplateSection[],
    fieldMappings: FieldMapping[],
    profile: any,
    contentHeight: number,
    maxPages: number,
    orientation: string
  ): PageContent[] {
    const pages: PageContent[] = [];
    let currentPage: PageContent = {
      pageNumber: 1,
      sections: [],
      partialSections: {}
    };
    let currentPageHeight = 0;

    for (const section of sections) {
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
      if (!sectionData || (Array.isArray(sectionData) && sectionData.length === 0)) {
        continue;
      }

      const estimatedHeight = SectionSplitter.estimateSectionHeight(
        section.section_type, 
        Array.isArray(sectionData) ? sectionData : [sectionData],
        orientation
      );

      // Check if this section fits on the current page
      if (currentPageHeight + estimatedHeight > contentHeight && currentPage.sections.length > 0) {
        pages.push(currentPage);
        currentPage = {
          pageNumber: pages.length + 1,
          sections: [],
          partialSections: {}
        };
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

  private getRequiredPagesForSections(
    sections: TemplateSection[],
    fieldMappings: FieldMapping[],
    profile: any,
    contentHeight: number,
    orientation: string
  ): number {
    let totalHeight = 0;
    let pages = 1;

    for (const section of sections) {
      if (section.section_type === 'page_break') {
        pages++;
        totalHeight = 0;
        continue;
      }

      const sectionData = SectionDataUtils.getSectionData(profile, section.section_type);
      if (!sectionData || (Array.isArray(sectionData) && sectionData.length === 0)) {
        continue;
      }

      const estimatedHeight = SectionSplitter.estimateSectionHeight(
        section.section_type, 
        Array.isArray(sectionData) ? sectionData : [sectionData],
        orientation
      );

      if (totalHeight + estimatedHeight > contentHeight) {
        pages++;
        totalHeight = estimatedHeight;
      } else {
        totalHeight += estimatedHeight;
      }
    }

    return pages;
  }

  private getPageSections(
    sections: TemplateSection[],
    fieldMappings: FieldMapping[],
    profile: any,
    contentHeight: number,
    pageIndex: number,
    orientation: string
  ): { sections: TemplateSection[], partialSections: any } {
    const result = {
      sections: [] as TemplateSection[],
      partialSections: {} as any
    };

    let currentPageIndex = 0;
    let currentPageHeight = 0;

    for (const section of sections) {
      // Handle page break sections
      if (section.section_type === 'page_break') {
        if (currentPageIndex === pageIndex) {
          break;
        }
        currentPageIndex++;
        currentPageHeight = 0;
        continue;
      }

      const sectionData = SectionDataUtils.getSectionData(profile, section.section_type);
      if (!sectionData || (Array.isArray(sectionData) && sectionData.length === 0)) {
        continue;
      }

      const estimatedHeight = SectionSplitter.estimateSectionHeight(
        section.section_type, 
        Array.isArray(sectionData) ? sectionData : [sectionData],
        orientation
      );

      // Check if this section fits on the current page
      if (currentPageHeight + estimatedHeight > contentHeight && currentPageHeight > 0) {
        currentPageIndex++;
        currentPageHeight = estimatedHeight;
      } else {
        currentPageHeight += estimatedHeight;
      }

      // If we're on the target page, add this section
      if (currentPageIndex === pageIndex) {
        result.sections.push(section);
      }
    }

    return result;
  }
}
