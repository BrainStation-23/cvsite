
import { SectionSplitter } from '@/utils/sectionSplitter';
import { LayoutStrategyFactory } from '@/components/admin/cv-templates/layout-strategies/LayoutStrategyFactory';
import { PageContent, TemplateSection, FieldMapping } from '@/components/admin/cv-templates/layout-strategies/LayoutStrategyInterface';
import { HTMLLayoutRenderer } from './HTMLLayoutRenderer';

export class HTMLPageDistributor {
  private layoutRenderer = new HTMLLayoutRenderer();

  distributePages(
    sections: TemplateSection[],
    fieldMappings: FieldMapping[],
    profile: any,
    layoutConfig: Record<string, any> = {},
    orientation: string = 'portrait'
  ): string[] {
    console.log('=== HTML PAGE DISTRIBUTOR DEBUG START ===');
    console.log('HTML Page Distributor - Input sections:', sections.length);
    console.log('HTML Page Distributor - Sections details:', sections.map(s => ({
      id: s.id,
      type: s.section_type,
      placement: s.styling_config?.layout_placement || 'main',
      order: s.display_order
    })));
    console.log('HTML Page Distributor - Field mappings:', fieldMappings.length);
    console.log('HTML Page Distributor - Field mappings by section:', 
      fieldMappings.reduce((acc, fm) => {
        acc[fm.section_type] = (acc[fm.section_type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    );

    if (!profile || sections.length === 0) {
      console.log('HTML Page Distributor - No profile or sections, returning empty page');
      return ['<div class="empty-page">No content to display</div>'];
    }

    const A4_CONTENT_HEIGHT = SectionSplitter.getContentHeight(orientation);
    const MAX_PAGES = 20;
    const layoutType = layoutConfig.layoutType || 'single-column';

    console.log('HTML Page Distributor - Layout config:', {
      layoutType,
      orientation,
      contentHeight: A4_CONTENT_HEIGHT
    });

    // Use the same strategy as the preview
    const strategy = LayoutStrategyFactory.createStrategy(layoutType);
    console.log('HTML Page Distributor - Using strategy:', strategy.constructor.name);
    
    const distributedPages = strategy.distribute(
      sections,
      fieldMappings,
      profile,
      A4_CONTENT_HEIGHT,
      MAX_PAGES,
      orientation
    );

    console.log('HTML Page Distributor - Distributed pages:', distributedPages.length);
    distributedPages.forEach((page, index) => {
      console.log(`HTML Page Distributor - Page ${index + 1}:`, {
        sectionsCount: page.sections.length,
        sections: page.sections.map(s => s.section_type),
        partialSections: Object.keys(page.partialSections)
      });
    });

    // Convert each page to HTML
    const htmlPages = distributedPages.map((pageContent, index) => {
      return this.generatePageHTML(
        pageContent,
        layoutType,
        index + 1,
        distributedPages.length
      );
    });

    console.log('=== HTML PAGE DISTRIBUTOR DEBUG END ===');
    return htmlPages;
  }

  private generatePageHTML(
    pageContent: PageContent,
    layoutType: string,
    pageNumber: number,
    totalPages: number
  ): string {
    console.log(`HTML Page Distributor - Generating HTML for page ${pageNumber}:`, {
      sectionsCount: pageContent.sections.length,
      sectionTypes: pageContent.sections.map(s => s.section_type),
      partialSections: Object.keys(pageContent.partialSections)
    });

    const sectionsHTML = this.layoutRenderer.generateLayoutHTML(
      pageContent.sections,
      [], // Field mappings are handled within sections
      {}, // Profile data is embedded in sections
      layoutType,
      pageContent.partialSections
    );

    return `<div class="cv-page" data-page="${pageNumber}">
      ${sectionsHTML}
      ${pageNumber < totalPages ? '<div class="page-break"></div>' : ''}
    </div>`;
  }
}
