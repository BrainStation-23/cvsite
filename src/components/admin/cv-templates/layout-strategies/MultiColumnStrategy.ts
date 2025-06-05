
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
    
    // Separate sections by placement
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
    
    // Process all sections together to ensure they appear on the same pages
    const allPages = Math.max(
      this.getRequiredPagesForSections(mainSections, fieldMappings, profile, contentHeight, orientation),
      this.getRequiredPagesForSections(sidebarSections, fieldMappings, profile, contentHeight, orientation)
    );

    // Create pages and distribute sections
    for (let pageIndex = 0; pageIndex < Math.min(allPages, maxPages); pageIndex++) {
      const currentPage: PageContent = {
        pageNumber: pageIndex + 1,
        sections: [],
        partialSections: {}
      };

      // Add main sections for this page
      const mainSectionsForPage = this.getPageSections(mainSections, fieldMappings, profile, contentHeight, pageIndex, orientation);
      currentPage.sections.push(...mainSectionsForPage.sections);
      Object.assign(currentPage.partialSections, mainSectionsForPage.partialSections);

      // Add sidebar sections for this page
      const sidebarSectionsForPage = this.getPageSections(sidebarSections, fieldMappings, profile, contentHeight, pageIndex, orientation);
      currentPage.sections.push(...sidebarSectionsForPage.sections);
      Object.assign(currentPage.partialSections, sidebarSectionsForPage.partialSections);

      if (currentPage.sections.length > 0 || Object.keys(currentPage.partialSections).length > 0) {
        pages.push(currentPage);
      }
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
