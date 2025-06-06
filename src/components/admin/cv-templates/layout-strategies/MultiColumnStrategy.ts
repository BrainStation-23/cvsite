
import { LayoutStrategy, PageContent, TemplateSection, FieldMapping } from './LayoutStrategyInterface';
import { PageProcessor } from './PageProcessor';
import { LayoutTypeDetector } from './LayoutTypeDetector';

export class MultiColumnStrategy implements LayoutStrategy {
  private pageProcessor = new PageProcessor();

  distribute(
    sections: TemplateSection[],
    fieldMappings: FieldMapping[],
    profile: any,
    contentHeight: number,
    maxPages: number,
    orientation: string
  ): PageContent[] {
    const { mainSections, sidebarSections } = LayoutTypeDetector.separateSectionsByPlacement(sections);

    console.log('Multi-column layout distribution:', {
      mainSections: mainSections.map(s => s.section_type),
      sidebarSections: sidebarSections.map(s => s.section_type)
    });

    const pages: PageContent[] = [];
    
    // Determine layout type for height calculations
    const layoutType = LayoutTypeDetector.getLayoutType(mainSections, sidebarSections);
    
    // Process main sections with page break support and layout-aware calculations
    const mainPages = this.pageProcessor.processSectionsWithPageBreaks(
      mainSections, fieldMappings, profile, contentHeight, maxPages, orientation, layoutType, 'main'
    );
    
    // Process sidebar sections with page break support and layout-aware calculations
    const sidebarPages = this.pageProcessor.processSectionsWithPageBreaks(
      sidebarSections, fieldMappings, profile, contentHeight, maxPages, orientation, layoutType, 'sidebar'
    );
    
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
}
